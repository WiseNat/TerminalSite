import FileSystemUtil from "./file_system_util.ts";

export default class FileImportUtil {
  /**
   * Reads the contents of a file at the provided path.
   *
   * @param filePath path to find a file.
   *
   * @returns file contents if found, `null` otherwise.
   */
  public static async readFile(filePath: string): Promise<string | null> {
    const fileUrl = this.getFileUrl(filePath);

    if (fileUrl === null) {
      return null;
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      return null;
    }

    return await response.text();
  }

  /**
   * Gets the local File URL for a given file path
   * @param filePath path to a file (does not need to be a valid path).
   * @returns null if the file url was unable to be created, the file url otherwise
   */
  public static getFileUrl(filePath: string): string | null {
    const base = __CONTENT_DIRECTORY;
    const resolvedPath = FileSystemUtil.resolvePath(filePath);

    if (resolvedPath === null) {
      return null;
    }

    return FileSystemUtil.joinPaths(base, resolvedPath);
  }
}
