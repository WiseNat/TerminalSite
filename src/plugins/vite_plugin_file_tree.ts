import fs from "fs";
import path from "path";
import { Plugin } from "vite";
import { FileTreeNode } from "virtual:file-tree";

/**
 * Walks along the provided {@code rootDirPath} recursively, returning a view of all the identified files and
 * directories.
 *
 * The returned object will not include any `.gitkeep` files. These are required for preserving empty directories in Git
 * and so if an empty directory is wanted for this function to find, it must contain a `.gitkeep` file.
 *
 * @param rootDirPath the root path to walk down.
 */
export function walk(rootDirPath: string): FileTreeNode[] {
  const allEntries = fs.readdirSync(rootDirPath, {
    withFileTypes: true,
    recursive: true,
  });

  const nodeMap = new Map<string, FileTreeNode>();
  const orphanChildren = new Map<string, FileTreeNode[]>();
  const result: FileTreeNode[] = [];

  for (const entry of allEntries) {
    if (isIgnoredFile(entry)) {
      continue;
    }

    const relativePath = path.relative(
      rootDirPath,
      path.join(entry.parentPath, entry.name),
    );
    const parentRelativePath = path.dirname(relativePath);

    const isRootChild = parentRelativePath === ".";
    const isDirectory = entry.isDirectory();

    const node: FileTreeNode = {
      name: entry.name,
      path: isRootChild ? "" : parentRelativePath,
      isDirectory: isDirectory,
      children: isDirectory ? [] : undefined,
    };

    nodeMap.set(relativePath, node);
    attachOrphanChildren(relativePath, node, orphanChildren);

    if (isRootChild) {
      result.push(node);
    } else {
      const parentNode = nodeMap.get(parentRelativePath);

      if (parentNode?.children) {
        parentNode.children.push(node);
      } else {
        storeAsOrphan(parentRelativePath, node, orphanChildren);
      }
    }
  }

  return result;
}

/**
 * @param entry the file entry to check
 *
 * @returns true if the entry is ignorable, false otherwise
 */
function isIgnoredFile(entry: fs.Dirent): boolean {
  return entry.name === ".gitkeep" && !entry.isDirectory();
}

/**
 * Attaches relevant orphan children to the provided node, if any exist.
 *
 * @param relativePath relative path of the `node`
 * @param node the parent node that the children will be attached to
 * @param orphanMap existing map of orphans
 */
function attachOrphanChildren(
  relativePath: string,
  node: FileTreeNode,
  orphanMap: Map<string, FileTreeNode[]>,
) {
  if (orphanMap.has(relativePath)) {
    node.children = orphanMap.get(relativePath);
    orphanMap.delete(relativePath);
  }
}

/**
 * Stores a node as an orphan in the `orphanMap`, alongside any other orphans
 * that a parent may have.
 *
 * @param parentPath relative path of the expected parent
 * @param node the orphan
 * @param orphanMap existing map of orpahsn
 */
function storeAsOrphan(
  parentPath: string,
  node: FileTreeNode,
  orphanMap: Map<string, FileTreeNode[]>,
) {
  if (!orphanMap.has(parentPath)) {
    orphanMap.set(parentPath, []);
  }

  orphanMap.get(parentPath)!.push(node);
}

/**
 * Vite plugin that constructs a file tree with relevant meta-data, available
 * from a `fileTree` import.
 *
 * @param rootPath the path relative to the project root directory that the file tree should be built from.
 * @constructor
 *
 * @example vite.config.ts
 * // ...
 *
 * export default defineConfig(({ mode }) => {
 *   return {
 *     plugins: [FileTree("some/relative/directory")],
 *     // ...
 *   }
 *
 * // ...
 *
 * @example Usage within a project
 * import { fileTree } from "virtual:file-tree";
 *
 * console.info(fileTree);
 */
export default function FileTree(rootPath?: string): Plugin {
  rootPath ??= "./";

  const name = "file-tree";
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: `vite-plugin-${name}`,

    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        const projectRoot = process.cwd();
        const absoluteRootPath = path.resolve(projectRoot, rootPath);

        if (!absoluteRootPath.startsWith(projectRoot)) {
          this.error(
            `Accessing a path outside of the project root is not allowed. The path '${rootPath}' resolved to ` +
              `'${absoluteRootPath}' which is outside of the project root '${projectRoot}'`,
          );
        }

        const tree = walk(absoluteRootPath);

        return `export const fileTree = ${JSON.stringify(tree, null, 2)}`;
      }
    },

    configureServer(server) {
      server.watcher.on("all", async (_eventName: string, filePath: string) => {
        const projectRoot = process.cwd();
        const relativePath = path.relative(
          projectRoot,
          path.normalize(filePath),
        );

        if (relativePath.startsWith(rootPath)) {
          server.config.logger.info(
            `\x1b[32m${relativePath} changed, restarting server...\x1b[0m`,
            { timestamp: true },
          );

          await server.restart();
        }
      });
    },
  };
}
