import fs from "fs";
import path from "path";
import { Plugin } from "vite";
import { FileTreeNode } from "virtual:file-tree";

/**
 * Walks along the provided {@code rootDirPath} recursively, returning a view of all the identified files and
 * directories.
 *
 * @param rootDirPath the root path to walk down.
 */
export function walk(rootDirPath: string): FileTreeNode[] {
  const allEntries = fs.readdirSync(rootDirPath, {
    withFileTypes: true,
    recursive: true,
  });

  const nodeMap = new Map<string, FileTreeNode>();
  const result: FileTreeNode[] = [];

  for (const entry of allEntries) {
    const relativePath = path.relative(
      rootDirPath,
      path.join(entry.parentPath, entry.name),
    );
    const parentRelativePath = path.dirname(relativePath);

    const isDirectRootChild = parentRelativePath === ".";
    const isDirectory = entry.isDirectory();

    const node: FileTreeNode = {
      name: entry.name,
      path: isDirectRootChild ? "" : parentRelativePath,
      isDirectory: isDirectory,
      children: isDirectory ? [] : undefined,
    };

    nodeMap.set(relativePath, node);

    if (isDirectRootChild) {
      result.push(node);
    } else {
      const parentNode = nodeMap.get(node.path);

      if (parentNode?.children) {
        parentNode.children.push(node);
      }
    }
  }

  return result;
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
  };
}
