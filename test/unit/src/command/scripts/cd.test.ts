import { beforeEach, describe, expect, test, vi } from "vitest";
import CD, {
  _resetWorkingDirectories,
} from "../../../../../src/command/scripts/cd";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import TerminalUtil from "../../../../../src/util/terminal_util";

describe("Cd", () => {
  beforeEach(() => {
    FileSystemUtil.setHomeDirectory("/home/nathanwise");
    FileSystemUtil.setCurrentWorkingDirectory("~");

    _resetWorkingDirectories();

    vi.clearAllMocks();
  });

  describe("run", () => {
    // Spy
    const setCurrentWorkingDirectory = vi.spyOn(
      FileSystemUtil,
      "setCurrentWorkingDirectory",
    );
    const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    describe("Successfully changes directory", () => {
      test("an existing directory path argument changes directory to that path", async () => {
        // Arrange
        const directoryPath = "/src/main";

        // Act
        await CD.run([directoryPath]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledExactlyOnceWith(
          directoryPath,
        );
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("no arguments changes directory to the HOME directory", async () => {
        // Arrange
        const homeDirectory = "/test";
        FileSystemUtil.setHomeDirectory(homeDirectory);

        // Act
        await CD.run([]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledExactlyOnceWith(
          homeDirectory,
        );
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("'-' as the argument when a previous working directory exists, changes directory to the previous working directory", async () => {
        // Arrange
        const previousWorkingDirectory = "/src/main";
        await CD.run([previousWorkingDirectory]);
        const currentWorkingDirectory = "/test";
        await CD.run([currentWorkingDirectory]);

        // Act
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledTimes(3);
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          1,
          previousWorkingDirectory,
        );
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          2,
          currentWorkingDirectory,
        );
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          3,
          previousWorkingDirectory,
        );

        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `\n${previousWorkingDirectory}`,
        );
      });

      test("'-' as the argument when multiple previous working directory exists, changes directory to the correct previous working directory", async () => {
        // Arrange
        const directoryPaths = [
          "/src/main",
          "/src/main/foo",
          "/src",
          "/src/main/foo/bar",
          "/test",
        ];

        for (const directoryPath of directoryPaths) {
          await CD.run([directoryPath]);
        }

        // Act
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledTimes(
          directoryPaths.length + 1,
        );
        for (let i = 0; i < directoryPaths.length; i++) {
          expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
            i + 1,
            directoryPaths[i],
          );
        }

        const previousWorkingDirectory =
          directoryPaths[directoryPaths.length - 2];
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          directoryPaths.length + 1,
          previousWorkingDirectory,
        );

        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `\n${previousWorkingDirectory}`,
        );
      });
    });

    describe("Error messages", () => {
      test("more than one argument outputs an error message", async () => {
        // Arrange & Act
        await CD.run(["/src", "/src"]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "\nbash: cd: too many arguments",
        );
      });

      test("'-' as the argument when a previous working directory does not exist outputs an error message", async () => {
        // Arrange & Act
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "\nbash: cd: OLDPWD not set",
        );
      });

      test("a file path argument outputs an error", async () => {
        // Arrange
        const directoryPath = "/src/index.ts";

        // Act
        await CD.run([directoryPath]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `\nbash: cd: ${directoryPath}: Not a directory`,
        );
      });

      test("a non-existent directory path argument outputs an error", async () => {
        // Arrange
        const directoryPath = "/fake/path";

        // Act
        await CD.run([directoryPath]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `\nbash: cd: ${directoryPath}: No such file or directory`,
        );
      });

      test("an unresolvable directory path argument outputs an error", async () => {
        // Arrange
        const directoryPath = "~test";

        // Act
        await CD.run([directoryPath]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `\nbash: cd: ${directoryPath}: No such file or directory`,
        );
      });
    });
  });
});
