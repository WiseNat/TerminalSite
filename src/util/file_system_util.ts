import { fileTree, FileTreeNode } from "virtual:file-tree";

export default class FileSystemUtil {
  private static currentWorkingDirectory: string[] = [];
  private static homeDirectory: string[] = [];

  public static readonly pathSeparator = "/";
  public static readonly homeDirectorySymbol = "~";
  public static readonly currentWorkingDirectorySymbol = ".";
  public static readonly parentDirectorySymbol = "..";

  public static readonly username = "nathanwise";

  /**
   * @returns the Current Working Directory as an absolute path.
   */
  public static getCurrentWorkingDirectory(): string[] {
    return this.currentWorkingDirectory;
  }

  /**
   * Sets the Current Working Directory as a single resolved conversion of the provided String paths.
   * <p>
   * Any symbols resolvable by {@link resolvePathParts} found in the provided String paths will be resolved.
   * This means that, for example, the previous Current Working Directory path can be used to set the new path.
   * E.g. if the previous CWD is `/home/nathanwise` then passing in `./Desktop` will set the CWD to
   * `/home/nathanwise/Desktop`.
   *
   * @param currentWorkingDirectory string paths to set the CWD to.
   *
   * @see resolvePathParts
   */
  // TODO: Unit test me
  public static setCurrentWorkingDirectory(
    currentWorkingDirectory: string,
  ): void {
    const resolvedPath = this.resolvePathParts(currentWorkingDirectory);
    this.currentWorkingDirectory = resolvedPath ?? [];
  }

  /**
   * @returns the Home Directory as an absolute path.
   */
  public static getHomeDirectory(): string[] {
    return this.homeDirectory;
  }

  /**
   * Sets the Home Directory as a single resolved conversion of the provided String paths.
   * <p>
   * Any symbols resolvable by {@link resolvePathParts} found in the provided String paths will be resolved.
   * This means that, for example, the previous Home Directory path can be used to set the new path.
   * E.g. if the previous Home Directory is `/home/nathanwise` then passing in `~/Desktop` will set the Home Directory
   * to `/home/nathanwise/Desktop`.
   *
   * @param homeDirectory string paths to set the Home Directory to.
   *
   * @see resolvePathParts
   */
  // TODO: Unit test me
  public static setHomeDirectory(homeDirectory: string): void {
    const resolvedPath = this.resolvePathParts(homeDirectory);
    this.homeDirectory = resolvedPath ?? [];
  }

  /**
   * Formats the given path in a human-readable format.
   * This includes a path separator at the beginning, and between directories & files.
   *
   * @param path path to format.
   * @private
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
  public static resolvePath(path: string): string | null {
    const resolvedPath = this.resolvePathParts(path);
    if (resolvedPath === null) {
      return null;
    }

    return this.formatPath(resolvedPath);
  }

  /**
   * Converts String paths into a single joined and resolved path.
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
   */
  public static resolvePathParts(path: string): string[] | null {
    // Resolve special starting symbols
    if (path.startsWith(this.homeDirectorySymbol)) {
      // TODO: rename
      const potentialPath = this.resolveHomePath(path);

      if (potentialPath === null) {
        return null;
      }

      path = potentialPath;
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

    path = this.normalisePath(path);

    const splitPath = path.split(this.pathSeparator);

    if (path.startsWith(this.pathSeparator)) {
      splitPath.shift();
    }

    // Remove empty elements
    return splitPath.filter(Boolean);
  }

  // TODO: JSDoc
  // TODO: Rename?
  private static resolveHomePath(homePath: string): string | null {
    // TODO: Handle ~USERNAME
    // TODO: get username. IF username in ["nathanwise", ""]; then add home dir. Otherwise return

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

  // TODO: JSDoc
  // TODO: Unit test
  public static isRelativePath(stringPath: string): boolean {
    return !stringPath.startsWith(this.pathSeparator);
  }

  /**
   * Walks along the File Tree using the provided path.
   *
   * @param path the path to walk
   *
   * @returns the files & directories under the path if the path exists, otherwise null
   */
  public static walkFileTree(path: string[]): FileTreeNode | null {
    let currentNodes = fileTree;
    let currentNode: FileTreeNode | undefined = {
      name: "",
      path: "",
      isDirectory: true,
      children: currentNodes,
    };

    for (const segment of path) {
      currentNode = currentNodes.find((n) => n.name === segment);

      // No node in the provided path has been found
      if (currentNode === undefined) {
        return null;
      }

      if (!currentNode.isDirectory) {
        return currentNode;
      }

      if (
        currentNode.children === undefined ||
        currentNode.children.length === 0
      ) {
        return null;
      }

      currentNodes = currentNode.children;
    }

    return currentNode ?? null;
  }

  /**
   * Resolves any instances of `..` parent directory symbols within the provided path.
   * <p>
   * This also removes instances of '.' current working directory symbols.
   *
   * @param path the path to have parent directories resolved for.
   * @private
   *
   * @returns a normalised path without parent directory symbols.
   */
  // TODO: Unit test?
  public static normalisePath(path: string): string {
    const splitPath = path.split(this.pathSeparator);
    const normalisedPath: string[] = [];

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

    return normalisedPath.join(this.pathSeparator);
  }
}
