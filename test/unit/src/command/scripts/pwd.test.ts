import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import pwd from "../../../../../src/command/scripts/pwd";

describe("Pwd", () => {
  describe("run", () => {
    // Spy
    const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    test("should output the current working directory", async () => {
      // Arrange
      const currentWorkingDirectory = "/home/nathanwise/Desktop";
      FileSystemUtil.setCurrentWorkingDirectory(currentWorkingDirectory);

      // Act
      await pwd.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `\n${currentWorkingDirectory}`,
      );
    });

    test("should output the resolved current working directory", async () => {
      // Arrange
      FileSystemUtil.setHomeDirectory("/home/nathanwise/");
      FileSystemUtil.setCurrentWorkingDirectory("~/Desktop");

      // Act
      await pwd.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        "\n/home/nathanwise/Desktop",
      );
    });

    test("should output the changed current working directory", async () => {
      // Arrange
      const firstCurrentWorkingDirectory = "/home/nathanwise/Desktop";
      FileSystemUtil.setCurrentWorkingDirectory(firstCurrentWorkingDirectory);

      // Act
      await pwd.run([]);

      const secondCurrentWorkingDirectory = "/usr/local/etc";
      FileSystemUtil.setCurrentWorkingDirectory(secondCurrentWorkingDirectory);

      await pwd.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledTimes(2);
      expect(appendOutput).toHaveBeenNthCalledWith(
        1,
        `\n${firstCurrentWorkingDirectory}`,
      );
      expect(appendOutput).toHaveBeenNthCalledWith(
        2,
        `\n${secondCurrentWorkingDirectory}`,
      );
    });
  });
});
