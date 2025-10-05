import { beforeEach, describe, expect, test, vi } from "vitest";
import CD, {
  _resetWorkingDirectories,
} from "../../../../../src/command/scripts/cd";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import TerminalUtil from "../../../../../src/util/terminal_util";

describe("Cd", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
  const setCurrentWorkingDirectory = vi.spyOn(
    FileSystemUtil,
    "setCurrentWorkingDirectory",
  );

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  const homeDirectory = "/src/main";

  beforeEach(() => {
    FileSystemUtil.setHomeDirectory(homeDirectory);
    FileSystemUtil.setCurrentWorkingDirectory("~");

    _resetWorkingDirectories();

    vi.clearAllMocks();
  });

  describe("run", () => {
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
        const previousWorkingDirectory = "/src/main/foo";
        await CD.run([previousWorkingDirectory]);

        // Act
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledTimes(2);
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          1,
          previousWorkingDirectory,
        );
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          2,
          homeDirectory,
        );

        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(homeDirectory);
      });

      test("'-' as the argument when two previous working directories exist, changes directory to the previous working directory", async () => {
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
          previousWorkingDirectory,
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
          previousWorkingDirectory,
        );
      });

      test("'-' multiple times swaps between two directories", async () => {
        // Arrange
        const newDirectory = "/src/main/foo";
        await CD.run([newDirectory]);

        // Act
        await CD.run(["-"]);
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).toHaveBeenCalledTimes(3);
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          1,
          newDirectory,
        );
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          2,
          homeDirectory,
        );
        expect(setCurrentWorkingDirectory).toHaveBeenNthCalledWith(
          1,
          newDirectory,
        );

        expect(appendOutput).toHaveBeenCalledTimes(2);
        expect(appendOutput).toHaveBeenNthCalledWith(1, homeDirectory);
        expect(appendOutput).toHaveBeenNthCalledWith(1, homeDirectory);
      });
    });

    describe("Error messages", () => {
      test("more than one argument outputs an error message", async () => {
        // Arrange & Act
        await CD.run(["/src", "/src"]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "bash: cd: too many arguments",
        );
      });

      test("'-' as the argument when a previous working directory does not exist outputs an error message", async () => {
        // Arrange & Act
        await CD.run(["-"]);

        // Assert
        expect(setCurrentWorkingDirectory).not.toHaveBeenCalled();
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "bash: cd: OLDPWD not set",
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
          `bash: cd: ${directoryPath}: Not a directory`,
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
          `bash: cd: ${directoryPath}: No such file or directory`,
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
          `bash: cd: ${directoryPath}: No such file or directory`,
        );
      });
    });
  });
});
