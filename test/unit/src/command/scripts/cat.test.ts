import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import cat from "../../../../../src/command/scripts/cat";
import FileImportUtil from "../../../../../src/util/file_import_util";
import FileSystemUtil from "../../../../../src/util/file_system_util";

describe("Cat", () => {
  describe("run", async () => {
    // Spy
    const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
    const readFile = vi.spyOn(FileImportUtil, "readFile");
    const resolvePath = vi.spyOn(FileSystemUtil, "resolvePath");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");
    vi.mock("../../../../../src/util/file_import_util");

    test("should output nothing when no args are passed", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await cat.run(args);

      // Assert
      expect(appendOutput).not.toHaveBeenCalled();
    });

    test("should output file contents when a path for a file that exists is given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt"];
      const fileContents = "SOME/\nEXAMPLE";
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(fileContents);

      // Act
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePath).not.toHaveBeenCalled();
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(`\n${fileContents}`);
    });

    test("should output an error message when a path for a file that does not exist is given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(null);

      // Act
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePath).toHaveBeenCalledOnce();

      const resolvedPath = FileSystemUtil.resolvePath(args[0]);
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
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
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePath).not.toHaveBeenCalled();
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `\n${fileContentsFirst}\n${fileContentsSecond}`,
      );
    });

    test("should output error messages when paths for files that do not exist are given", async () => {
      // Arrange
      const args: string[] = ["/home/test.txt", "home/another.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValue(null);

      // Act
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePath).toHaveBeenCalledTimes(2);

      const resolvedPathFirst = FileSystemUtil.resolvePath(args[0]);
      const resolvedPathSecond = FileSystemUtil.resolvePath(args[1]);
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
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
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(resolvePath).toHaveBeenCalledOnce();

      const resolvedPath = FileSystemUtil.resolvePath(args[0]);
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${resolvedPath}: No such file or directory\n${fileContentsFirst}`,
      );
    });

    test("should output an error message when a path for a file that does not exist is given and the path fails to resolve", async () => {
      // Arrange
      const args: string[] = ["~fakeuser/test.txt"];
      vi.mocked(FileImportUtil.readFile).mockResolvedValueOnce(null);

      // Act
      await cat.run(args);

      // Assert
      expect(readFile).toHaveBeenCalledOnce();
      expect(resolvePath).toHaveBeenCalledOnce();

      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `\ncat: ${args[0]}: No such file or directory`,
      );
    });
  });
});
