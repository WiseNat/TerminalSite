// Does not function correctly as a readonly within FileImportUtil
// .gitkeep should not be included, see 'walk' in 'vite_plugin_file_tree.ts' for in-depth explanation.
import FileSystemUtil from "./file_system_util.ts";

const FILES = import.meta.glob<{ default: string }>(
  ["./**/*", "!./**/*.gitkeep"],
  {
    exhaustive: true,
    base: "/src/content",
    query: "?raw",
  },
);

export default class FileImportUtil {
  /**
   * Reads the contents of a file at the provided path.
   *
   * @param filePath path to find a file.
   *
   * @returns file contents if found, `null` otherwise.
   */
  public static async readFile(filePath: string): Promise<string | null> {
    // '.' is required at the start due to how import meta glob imports work
    filePath = "." + FileSystemUtil.resolvePath(filePath);

    if (!(filePath in FILES)) {
      return null;
    }

    const loader = FILES[filePath];
    const fileContent = await loader();
    return fileContent.default;
  }
}
