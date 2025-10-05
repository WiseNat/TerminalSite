import { fileTree, FileTreeNode } from "virtual:file-tree";
import TerminalUtil from "./terminal_util.ts";
import {
  ARCHIVE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  GRAPHIC_EXTENSIONS,
  RUBBISH_EXTENSIONS,
} from "../constant/extensions.ts";

export default class FileSystemUtil {
  private static currentWorkingDirectory: string[] = [];
  private static homeDirectory: string[] = [];

  public static readonly pathSeparator = "/";
  public static readonly homeDirectorySymbol = "~";
  public static readonly currentWorkingDirectorySymbol = ".";
  public static readonly parentDirectorySymbol = "..";
  public static readonly dotEntrySymbol = ".";

  public static readonly username = "nathanwise";

  /**
   * @returns the Current Working Directory as an unformatted path.
   * @see formatPath
   */
  public static getCurrentWorkingDirectory(): string[] {
    return this.currentWorkingDirectory;
  }

  /**
   * @returns the Home Directory as an unformatted path.
   * @see formatPath
   */
  public static getHomeDirectory(): string[] {
    return this.homeDirectory;
  }

  /**
   * Sets the Current Working Directory as a resolved conversion of the provided path.
   * <p>
   * Any symbols resolvable by {@link resolvePathParts} found in the provided String paths will be resolved.
   * This means that, for example, the previous Current Working Directory path can be used to set the new path.
   * E.g. if the previous CWD is `/home/nathanwise`, then passing in `./Desktop` to this method will set the CWD to
   * `/home/nathanwise/Desktop`.
   *
   * @param currentWorkingDirectory string path to set the CWD to.
   *
   * @see resolvePathParts
   */
  public static setCurrentWorkingDirectory(
    currentWorkingDirectory: string,
  ): void {
    const resolvedPath = this.resolvePathParts(currentWorkingDirectory);
    this.currentWorkingDirectory = resolvedPath ?? [];

    TerminalUtil.setPromptPath(this.formatPath(this.currentWorkingDirectory));
  }

  /**
   * Sets the Home Directory as a single resolved conversion of the provided path.
   * <p>
   * Any symbols resolvable by {@link resolvePathParts} found in the provided String paths will be resolved.
   * This means that, for example, the previous Home Directory path can be used to set the new path.
   * E.g. if the previous Home Directory is `/home/nathanwise`, then passing in `./Desktop` to this method will set the
   * Home Directory to `/home/nathanwise/Desktop`.
   *
   * @param homeDirectory string path to set the Home Directory to.
   *
   * @see resolvePathParts
   */
  public static setHomeDirectory(homeDirectory: string): void {
    const resolvedPath = this.resolvePathParts(homeDirectory);
    this.homeDirectory = resolvedPath ?? [];
  }

  /**
   * Joins together multiple paths, ensuring that leading and trailing path separators are retained.
   * E.g. `["/home/nathanwise", "/Desktop/"]` -> `"/home/nathanwise/Desktop/"`
   *
   * @param paths the paths to join together.
   * @returns the resulting joined path.
   */
  public static joinPaths(...paths: string[]) {
    if (paths.length === 0) {
      return "";
    }

    const hasLeadingSeparator = paths[0].startsWith(this.pathSeparator);
    const hasTrailingSeparator = paths[paths.length - 1].endsWith(
      this.pathSeparator,
    );

    const splitPaths: string[] = [];
    for (const path of paths) {
      const splitPath = this.splitPath(path);
      splitPaths.push(...splitPath);
    }

    return (
      (hasLeadingSeparator ? this.pathSeparator : "") +
      splitPaths.join(this.pathSeparator) +
      (hasTrailingSeparator ? this.pathSeparator : "")
    );
  }

  /**
   * Splits paths into segments based on the {@link pathSeparator}.
   *
   * @param path
   *
   * @returns the split paths, e.g. `"/home/nathanwise/Desktop" -> ["home", "nathanwise", "Desktop"]`
   */
  public static splitPath(path: string): string[] {
    const splitPath = path.split(this.pathSeparator);

    if (path.startsWith(this.pathSeparator)) {
      splitPath.shift();
    }

    // Remove empty elements
    return splitPath.filter(Boolean);
  }

  /**
   * Formats the given path in a human-readable format.
   * This includes a path separator at the beginning, and between directories & files.
   * This method should be used carefully, as an already segmented path has lost information pertaining to
   * whether it is absolute or relative; this method assumes the given segmented path is absolute.
   *
   * @param path segmented absolute path to format.
   *
   * @returns the formatted path, e.g. `/home/nathanwise/Desktop`.
   */
  public static formatPath(path: string[]): string {
    return this.pathSeparator + path.join(this.pathSeparator);
  }

  /**
   * Resolves a path and converts it to a String.
   *
   * @returns the resolved string path.
   *
   * @see resolvePathParts
   * @see formatPath
   */
  public static resolvePath(
    path: string,
    keepTrailingDot?: boolean,
  ): string | null {
    const resolvedPath = this.resolvePathParts(path, keepTrailingDot);
    if (resolvedPath === null) {
      return null;
    }

    return this.formatPath(resolvedPath);
  }

  /**
   * Resolves the given path.
   * Any of the following symbols found in the provided String paths will be resolved:
   * <ul>
   *   <li>Home Directory: `~`</li>
   *   <li>Current Working Directory: `.`</li>
   *   <li>Parent Directory: `..`</li>
   * </ul>
   * <p>
   * To convert the path into a human-readable format, use {@link formatPath}.
   *
   * @param path
   * @param keepTrailingDot
   */
  public static resolvePathParts(
    path: string,
    keepTrailingDot?: boolean,
  ): string[] | null {
    // Resolve special starting symbols
    if (path.startsWith(this.homeDirectorySymbol)) {
      const resolvedHomePath = this.resolveHomePath(path);

      if (resolvedHomePath === null) {
        return null;
      }

      path = resolvedHomePath;
    } else if (
      path.startsWith(this.currentWorkingDirectorySymbol + this.pathSeparator)
    ) {
      // Let Relative path logic handle this
      path = path.slice(
        this.currentWorkingDirectorySymbol.length + this.pathSeparator.length,
      );
    }

    if (this.isRelativePath(path)) {
      const currentWorkingDirectoryString = this.formatPath(
        this.currentWorkingDirectory,
      );

      path = currentWorkingDirectoryString + this.pathSeparator + path;
    }

    path = this.normalisePath(path, keepTrailingDot);

    return this.splitPath(path);
  }

  /**
   * Resolves the provided Home Directory path by replacing either of the following with the absolute home directory
   * path:
   * <ul>
   *   <li> Home Directory symbol followed by a username e.g. `~nathanwise`
   *  <li>Standalone Home Directory symbol e.g. `~`
   * </ul>
   *
   * @param homePath a path that starts with the home directory symbol `~`
   * @private
   */
  private static resolveHomePath(homePath: string): string | null {
    const pathSeparatorIndex = homePath.indexOf(this.pathSeparator);

    let username: string;
    if (pathSeparatorIndex === -1) {
      username = homePath.slice(this.homeDirectorySymbol.length);
    } else {
      username = homePath.slice(
        this.homeDirectorySymbol.length,
        pathSeparatorIndex,
      );
    }

    if (username !== "" && username !== this.username) {
      return null;
    }

    const homeDirectoryString = this.formatPath(this.homeDirectory);
    const pathWithoutHomeSymbol = homePath.slice(
      this.homeDirectorySymbol.length + username.length,
    );

    return homeDirectoryString + pathWithoutHomeSymbol;
  }

  /**
   * Checks if the provided path is a relative path or not.
   * <p>
   * This does not consider the result of any path substitutions such as:
   * <ul>
   *   <li>Home Directory: `~`</li>
   *   <li>Current Working Directory: `.`</li>
   *   <li>Parent Directory: `..`</li>
   * </ul>
   *
   * @param stringPath
   *
   * @returns true if the path is a relative path, false otherwise.
   */
  public static isRelativePath(stringPath: string): boolean {
    return !stringPath.startsWith(this.pathSeparator);
  }

  /**
   * Resolves any instances of `..` parent directory symbols within the provided path.
   * <p>
   * This also removes instances of `.` current working directory symbols.
   *
   * @param path the path to have parent directories resolved for.
   * @param keepTrailingDot
   *
   * @returns a normalised path without parent directory symbols.
   */
  public static normalisePath(
    path: string,
    keepTrailingDot: boolean = false,
  ): string {
    const splitPath = path.split(this.pathSeparator);
    const normalisedPath: string[] = [];

    if (splitPath.length === 0) {
      return "";
    }

    for (const directory of splitPath) {
      if (directory === this.currentWorkingDirectorySymbol) {
        continue;
      }

      if (directory === this.parentDirectorySymbol) {
        normalisedPath.pop();
      } else {
        normalisedPath.push(directory);
      }
    }

    if (
      keepTrailingDot &&
      splitPath[splitPath.length - 1] === this.currentWorkingDirectorySymbol
    ) {
      normalisedPath.push(this.currentWorkingDirectorySymbol);
    }

    return normalisedPath.join(this.pathSeparator);
  }

  /**
   * Walks along the File Tree using the provided path.
   *
   * @param path the path to walk
   *
   * @returns the files & directories under the path if the path exists, otherwise null
   */
  public static walkFileTree(path: string[]): FileTreeNode | null {
    let currentNodes: FileTreeNode[] | undefined = fileTree;
    let currentNode: FileTreeNode | undefined = {
      name: "",
      path: "",
      isDirectory: true,
      children: currentNodes,
      lastModifiedTime: new Date(),
      size: 0,
      permissions: [],
      owner: "",
      group: "",
      blocks: 0,
    };

    for (const segment of path) {
      if (currentNodes === undefined) {
        return null;
      }

      currentNode = currentNodes.find((n) => n.name === segment);

      // No node in the provided path has been found
      if (currentNode === undefined) {
        return null;
      }

      if (!currentNode.isDirectory) {
        return currentNode;
      }

      currentNodes = currentNode.children;
    }

    return currentNode ?? null;
  }

  /**
   * Checks if the File in the path provided exists.
   *
   * @param path the file path to check.
   *
   * @returns true if the file exists, false otherwise.
   */
  public static doesFileExist(path: string[]): boolean {
    const node = this.walkFileTree(path);

    if (node === null) {
      return false;
    }

    return !node.isDirectory;
  }

  /**
   * Checks if the Directory in the path provided exists.
   *
   * @param path the directory path to check.
   *
   * @returns true if the directory exists, false otherwise.
   */
  public static doesDirectoryExist(path: string[]): boolean {
    const node = this.walkFileTree(path);

    if (node === null) {
      return false;
    }

    return node.isDirectory;
  }

  /**
   * Checks if the File or Directory in the path provided exists.
   *
   * @param path the path to check.
   *
   * @returns true if the file or directory exists, false otherwise.
   */
  public static doesFileOrDirectoryExist(path: string[]): boolean {
    return this.walkFileTree(path) !== null;
  }

  /**
   * Strips any occurrences of '.' within the provided `path`. This does not
   * normalise the path. For path normalisation see {@link normalisePath}.
   *
   * @param path the path to clean.
   * @returns a path without any instances of '.'.
   */
  public static stripDots(path: string): string {
    return path.replace(/\./g, "");
  }

  /**
   * @param filename the file name to check
   * @returns true if the file is a dot-file or dot-directory, false otherwise.
   */
  public static isDotEntry(filename: string): boolean {
    return filename.startsWith(this.dotEntrySymbol);
  }

  /**
   * Gets the extension in the given filename.
   *
   * @param filename the filename to pull the extension from.
   * @returns the extension or an empty string if it does not exist.
   */
  public static getExtension(filename: string): string {
    const index = filename.lastIndexOf(".");
    if (index === -1) {
      return "";
    }

    return filename.slice(index + 1);
  }

  /**
   * Checks if the permissions have at least one executable bit in any group.
   * <p>
   * Permissions values are denoted in octal form where, in binary, `XX1` means a
   * permission has an executable bit.
   *
   * @param permissions
   * @returns true if at least one executable bit is found, false otherwise
   */
  public static isExecutable(permissions: number[]): boolean {
    return permissions.some((n) => (n & 1) === 1);
  }

  /**
   * Checks if the `filename` has a known archive file extension.
   *
   * @param filename the filename to check the extension of.
   * @returns true if the file is an archive file, false otherwise.
   */
  public static isArchiveFile(filename: string): boolean {
    const extension = this.getExtension(filename);
    return ARCHIVE_EXTENSIONS.includes(extension);
  }

  /**
   * Checks if the `filename` has a known graphics file extension.
   *
   * @param filename the filename to check the extension of.
   * @returns true if the file is a graphics file, false otherwise.
   */
  public static isGraphicsFile(filename: string): boolean {
    const extension = this.getExtension(filename);
    return GRAPHIC_EXTENSIONS.includes(extension);
  }

  /**
   * Checks if the `filename` has a known audio file extension.
   *
   * @param filename the filename to check the extension of.
   * @returns true if the file is an audio file, false otherwise.
   */
  public static isAudioFile(filename: string): boolean {
    const extension = this.getExtension(filename);
    return AUDIO_EXTENSIONS.includes(extension);
  }

  /**
   * Checks if the `filename` has a known rubbish file extension.
   *
   * @param filename the filename to check the extension of.
   * @returns true if the file is a rubbish file, false otherwise.
   */
  public static isRubbishFile(filename: string): boolean {
    const extension = this.getExtension(filename);
    return RUBBISH_EXTENSIONS.includes(extension);
  }

  /**
   * Calculates the amount of Blocks based on the current `blocks`, `from`, and the `to`.
   *
   * @param blocks the current amount of blocks.
   * @param from the current block size for the current blocks.
   * @param to the new block size.
   */
  public static calculateBlocks(
    blocks: number,
    from: number,
    to: number,
  ): number {
    return Math.ceil((blocks * from) / to);
  }

  /**
   * Calculates the Hard Links for the provided `fileTreeNode`.
   * <p>
   * Hard links are the sum of hard-links to a given file. For a file in this
   * site, this will always be 1. For a directory, this will be 2 (mimicking a
   * hard link to itself . and it's parent ..) plus the amount of immediate
   * directory children.
   *
   * @param fileTreeNode the file tree node to calculate the hard links for.
   */
  public static calculateHardLinks(fileTreeNode: FileTreeNode): number {
    let hardLinks: number;
    if (fileTreeNode.isDirectory) {
      hardLinks = 2;

      for (const child of fileTreeNode.children!) {
        if (child.isDirectory) {
          hardLinks++;
        }
      }
    } else {
      hardLinks = 1;
    }

    return hardLinks;
  }

  /**
   * Converts bytes into a human-readable format.
   * This will turn the give amount of bytes into the smallest possible number
   * rounded up. The possible units are `K, M, G`.
   * <p>
   * @example
   * FileSystemUtil.getHumanReadableSize(1)              // 1K
   * FileSystemUtil.getHumanReadableSize(0)              // 1K
   * FileSystemUtil.getHumanReadableSize(5121)           // 5K
   * FileSystemUtil.getHumanReadableSize(6442450944)     // 6G
   * FileSystemUtil.getHumanReadableSize(5497558138880)  // 5120G
   *
   * @param bytes
   */
  public static getHumanReadableSize(bytes: number): string {
    const units = ["K", "M", "G"];
    let unitIndex = 0;
    const kilobyte = 1024;

    bytes = bytes / kilobyte;

    while (bytes > kilobyte && unitIndex < units.length - 1) {
      bytes = bytes / kilobyte;
      unitIndex += 1;
    }

    bytes = Math.ceil(bytes);
    return `${bytes === 0 ? 1 : bytes}${units[unitIndex]}`;
  }

  /**
   * Converts the permissions into a human-readable format.
   * This will convert permissions from 'octal' numbers into rwx values.
   * <p>
   * @example
   * FileSystemUtil.getHumanReadablePermissions([0, 0, 0], false) // ----------
   * FileSystemUtil.getHumanReadablePermissions([1, 2, 3], false) // ---x-w--wx
   * FileSystemUtil.getHumanReadablePermissions([4, 5, 6], true) // dr--r-xrw-
   *
   * @param permissions the permissions to transform.
   * @param isDirectory whether the permissions are for a file or directory.
   */
  public static getHumanReadablePermissions(
    permissions: number[],
    isDirectory: boolean,
  ): string {
    const symbols = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    const typeChar = isDirectory ? "d" : "-";
    return typeChar + permissions.map((p) => symbols[p]).join("");
  }

  /**
   * Sorts the given `nodes` alphabetically, ignoring any `.` chars that exist.
   *
   * @param nodes list of nodes to sort.
   */
  public static sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
    nodes = nodes.slice();

    nodes.sort((a, b) => {
      const aString = FileSystemUtil.stripDots(
        FileSystemUtil.joinPaths(a.path, a.name),
      );
      const bString = FileSystemUtil.stripDots(
        FileSystemUtil.joinPaths(b.path, b.name),
      );

      return aString.localeCompare(bString);
    });

    return nodes;
  }
}
