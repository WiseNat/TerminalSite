import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CAT from "../../../../../src/command/scripts/cat";
import FileImportUtil from "../../../../../src/util/file_import_util";
import FileSystemUtil from "../../../../../src/util/file_system_util";

describe("Cat", () => {
  // Spy
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");
  const readFile = vi.spyOn(FileImportUtil, "readFile");
  const resolvePathParts = vi.spyOn(FileSystemUtil, "resolvePathParts");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/file_import_util");

  describe("run", async () => {
    test("should output nothing when no args are passed", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await CAT.run(args);

      // Assert
      expect(appendRawOutput).not.toHaveBeenCalled();
    });

    test("should output file contents when a path for a file that exists is given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt"];
      const fileContents = "SOME/\nEXAMPLE";
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(fileContents);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePathParts).not.toHaveBeenCalled();
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\n${fileContents}`,
      );
    });

    test("should output an error message when a path for a file that does not exist is given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(null);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePathParts).toHaveBeenCalledOnce();

      const resolvedPath = FileSystemUtil.resolvePath(args[0]);
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${resolvedPath}: No such file or directory`,
      );
    });

    test("should output file contents of multiple files that exist", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt", "home/another.txt"];
      const fileContentsFirst = "SOME/\nEXAMPLE";
      const fileContentsSecond = "something ELSE!";
      vi.mocked(FileImportUtil.readFile)
        .mockResolvedValueOnce(fileContentsFirst)
        .mockResolvedValueOnce(fileContentsSecond);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePathParts).not.toHaveBeenCalled();
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\n${fileContentsFirst}\n${fileContentsSecond}`,
      );
    });

    test("should output error messages when paths for files that do not exist are given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt", "home/another.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValue(null);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePathParts).toHaveBeenCalledTimes(2);

      const resolvedPathFirst = FileSystemUtil.resolvePath(args[0]);
      const resolvedPathSecond = FileSystemUtil.resolvePath(args[1]);
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${resolvedPathFirst}: No such file or directory\ncat: ${resolvedPathSecond}: No such file or directory`,
      );
    });

    test("should output file contents of a file that exists and error messages for a files that does not exist", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt", "home/another.txt"];
      const fileContentsFirst = "SOME/\nEXAMPLE";
      vi.mocked(FileImportUtil.readFile)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(fileContentsFirst);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePathParts).toHaveBeenCalledOnce();

      const resolvedPath = FileSystemUtil.resolvePath(args[0]);
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${resolvedPath}: No such file or directory\n${fileContentsFirst}`,
      );
    });

    test("should output an error message when a path for a file that does not exist is given and the path fails to resolve", async () => {
      // Arrange
      const args: string[] = ["~fakeuser/test.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(null);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePathParts).toHaveBeenCalledOnce();

      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${args[0]}: No such file or directory`,
      );
    });

    test("should output an error message when a path is for a directory", async () => {
      // Arrange
      const args: string[] = ["/src/main"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(null);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePathParts).toHaveBeenCalledOnce();

      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${args[0]}: Is a directory`,
      );
    });

    test("should replace Markdown URLs with an 'a' tag when outputting the contents of a file that exists", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt"];
      const fileContents =
        "AN EXAMPLE CONTAINING [some text](https://duckduckgo.com/?hps=1&q=foobar&atb=v446-1&ia=web) <- A URL";
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(fileContents);

      // Act
      await CAT.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePathParts).not.toHaveBeenCalled();

      const replacedFileContents =
        "AN EXAMPLE CONTAINING <a href='https://duckduckgo.com/?hps=1&q=foobar&atb=v446-1&ia=web' target='_blank'>some text</a> &lt;- A URL";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        `\n${replacedFileContents}`,
      );
    });
  });
});
