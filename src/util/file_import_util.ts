// TODO: Unit/Integration tests?

// Does not function correctly as a readonly within FileImportUtil
// .gitkeep should not be included, see 'walk' in 'vite_plugin_file_tree.ts' for in-depth explanation.
const files = import.meta.glob<{ default: string }>(
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
    if (!(filePath in files)) {
      return null;
    }

    // TODO: resolve file path, e.g. "../foo/../../bar/foo/testing.txt" or "~/.test" or "/var/test.txt"

    const loader = files[filePath];
    const fileContent = await loader();
    return fileContent.default;
  }
}
