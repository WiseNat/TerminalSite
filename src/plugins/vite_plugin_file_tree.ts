import fs from "fs";
import PathUtil from "path";
import { Plugin } from "vite";
import { FileTreeNode } from "virtual:file-tree";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import * as devalue from "devalue";

interface AdditionalMetaData {
  permissions: number[];
  owner: string;
  group: string;
}

/**
 * Walks along the provided {@code rootDirPath} recursively, returning a view of all the identified files and
 * directories.
 *
 * The returned object will not include any `.gitkeep` files. These are required for preserving empty directories in Git
 * and so if an empty directory is wanted for this function to find, it must contain a `.gitkeep` file.
 *
 * @param rootDirPath the root path to walk down.
 * @param homeDirectory the user home directory, if defined.
 */
export function walk(
  rootDirPath: string,
  homeDirectory?: string,
): FileTreeNode[] {
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

    const filename = entry.name;
    const absoluteParentPath = entry.parentPath;
    const absolutePath = PathUtil.join(absoluteParentPath, filename);
    const relativePath = PathUtil.relative(rootDirPath, absolutePath);
    const parentRelativePath = PathUtil.dirname(relativePath);

    const isRootChild = parentRelativePath === ".";
    const isDirectory = entry.isDirectory();
    const additionalMetaData = getAdditionalMetaData(
      absolutePath,
      relativePath,
      homeDirectory,
    );

    const stats = statSync(absolutePath);

    const node: FileTreeNode = {
      name: filename,
      path: isRootChild ? "" : parentRelativePath,
      isDirectory: isDirectory,
      children: isDirectory ? [] : undefined,
      lastModifiedTime: getLastModifiedTime(absolutePath),
      size: stats.size,
      permissions: additionalMetaData.permissions,
      owner: additionalMetaData.owner,
      group: additionalMetaData.group,
      blocks: stats.blocks,
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
  return (
    (entry.name === ".gitkeep" || entry.name.endsWith(".meta")) &&
    !entry.isDirectory()
  );
}

/**
 * Gets the Last Modified Time of a File/Directory in the given `path`.
 * <p>
 * If this file is in a Git repo, the last time the file had changes committed will be used. Otherwise, the last file
 * modification date will be used instead.
 *
 * @param path an absolute path to a File or Directory
 * @returns a `Date` of the last modified time of the `path`
 */
function getLastModifiedTime(path: string): Date {
  try {
    return new Date(
      execSync(`git log -1 --format=%ci -- "${path}"`, {
        encoding: "utf-8",
      }).trim(),
    );
  } catch {
    return new Date(statSync(path).mtime);
  }
}

/**
 * Retrieves the {@link AdditionalMetaData} of the file at the given `parentPath/fileName` path.
 * This will be pulled from `.meta` files with the same name as a given file. For example, if a Directory `foo` exists
 * then a `foo.meta` file will be searched for. The contents of this file will contain the {@link AdditionalMetaData} of
 *  the `foo` directory.
 * <p>
 * If no `.meta` file is found for a given File or Directory, or if the `.meta` file is missing fields, the following
 * default values will apply:
 * - `permissions` [6, 6, 4]
 * - `owner` 'root' unless the path is within the `homeDirectory`, in which case the user of the home directory
 * - `group` 'root' unless the path is within the `homeDirectory`, in which case the user of the home directory
 *
 * @param path the absolute path of the File or Directory.
 * @param relativePath the path of the File or Directory relative to the `rootDirPath`.
 * @param homeDirectory the directory containing user home directories.
 */
function getAdditionalMetaData(
  path: string,
  relativePath: string,
  homeDirectory?: string,
): AdditionalMetaData {
  const metaDataFilePath = `${path}.meta`;

  let user = "root";
  if (homeDirectory !== undefined && relativePath.startsWith(homeDirectory)) {
    const homeUser = PathUtil.relative(homeDirectory, relativePath).split(
      PathUtil.sep,
    )[0];

    if (homeUser !== "") {
      user = homeUser;
    }
  }

  const defaultMetaData = {
    permissions: [6, 6, 4],
    group: user,
    owner: user,
  };

  if (!existsSync(metaDataFilePath)) {
    return defaultMetaData;
  }

  // TODO: Log this properly. Currently interrupts the build logs
  // console.info(`Found a metadata file for ${path}`);
  const fileContents = readFileSync(metaDataFilePath, { encoding: "utf8" });
  const additionalMetaData: AdditionalMetaData = JSON.parse(fileContents);
  additionalMetaData.permissions ??= defaultMetaData.permissions;
  additionalMetaData.group ??= defaultMetaData.group;
  additionalMetaData.owner ??= defaultMetaData.owner;

  return additionalMetaData;
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
 * @param orphanMap existing map of orphans
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
 * @param homeDirectory the 'home' directory containing user home directories. Used for determining file metadata.
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
export default function FileTree(
  rootPath?: string,
  homeDirectory?: string,
): Plugin {
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
        const absoluteRootPath = PathUtil.resolve(projectRoot, rootPath);

        if (!absoluteRootPath.startsWith(projectRoot)) {
          this.error(
            `Accessing a path outside of the project root is not allowed. The path '${rootPath}' resolved to ` +
              `'${absoluteRootPath}' which is outside of the project root '${projectRoot}'`,
          );
        }

        const tree = walk(absoluteRootPath, homeDirectory);
        return `export const fileTree = ${devalue.uneval(tree)}`;
      }
    },

    configureServer(server) {
      server.watcher.on("all", async (_eventName: string, filePath: string) => {
        const projectRoot = process.cwd();
        const relativePath = PathUtil.relative(
          projectRoot,
          PathUtil.normalize(filePath),
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
