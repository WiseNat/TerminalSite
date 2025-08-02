export default class FileSystemUtil {
  private static currentWorkingDirectory: string[] = [];
  private static homeDirectory: string[] = [];

  private static readonly pathSeparator = "/";
  private static readonly homeDirectorySymbol = "~";
  private static readonly currentWorkingDirectorySymbol = ".";
  private static readonly parentDirectorySymbol = "..";

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
  public static setCurrentWorkingDirectory(
    ...currentWorkingDirectory: string[]
  ): void {
    this.currentWorkingDirectory = this.resolvePathParts(
      ...currentWorkingDirectory,
    );
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
  public static setHomeDirectory(...homeDirectory: string[]): void {
    this.homeDirectory = this.resolvePathParts(...homeDirectory);
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
  public static resolvePath(unresolvedStringPath: string): string {
    const path = this.resolvePathParts(unresolvedStringPath);
    return this.formatPath(path);
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
   * @param paths
   */
  public static resolvePathParts(...paths: string[]): string[] {
    let joinedPath: string[] = this.joinPaths(...paths);

    // Handle special starting symbols
    if (joinedPath.length > 0) {
      const firstDirectory = joinedPath[0];

      if (firstDirectory === this.homeDirectorySymbol) {
        joinedPath.shift();
        joinedPath.unshift(...this.getHomeDirectory());
      } else if (firstDirectory === this.currentWorkingDirectorySymbol) {
        joinedPath.shift();
        joinedPath.unshift(...this.getCurrentWorkingDirectory());
      }
    }

    // Ignore CWD symbols
    joinedPath = joinedPath.filter((path: string) => {
      return path !== this.currentWorkingDirectorySymbol;
    });

    return this.normalisePath(joinedPath);
  }

  /**
   * Joins provided string paths into a single path.
   * When string paths with multiple consecutive path separators are provided, additional path separators are ignored,
   * when forming the resulting path.
   *
   * @param stringPaths the paths to combine.
   * @private
   *
   * @returns the joined paths as an array.
   */
  private static joinPaths(...stringPaths: string[]): string[] {
    const combinedPath: string[] = [];

    for (const stringPath of stringPaths) {
      let previousCharWasSeparator = false;
      let buffer = "";

      for (const char of stringPath) {
        const isSeparator = char === this.pathSeparator;

        if (isSeparator) {
          if (!previousCharWasSeparator && buffer !== "") {
            combinedPath.push(buffer);
            buffer = "";
          }

          previousCharWasSeparator = true;
          continue;
        }

        previousCharWasSeparator = false;
        buffer += char;
      }

      if (buffer !== "") {
        combinedPath.push(buffer);
      }
    }

    return combinedPath;
  }

  /**
   * Resolves any instances of `..` parent directory symbols within the provided path.
   *
   * @param path the path to have parent directories resolved for.
   * @private
   *
   * @returns a normalised path without parent directory symbols.
   */
  private static normalisePath(path: string[]): string[] {
    const normalisedPath: string[] = [];

    for (const directory of path) {
      if (directory === this.parentDirectorySymbol) {
        normalisedPath.pop();
      } else {
        normalisedPath.push(directory);
      }
    }

    return normalisedPath;
  }
}
