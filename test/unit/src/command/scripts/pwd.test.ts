import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import PWD from "../../../../../src/command/scripts/pwd";

describe("Pwd", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  describe("run", () => {
    test("should output the current working directory", async () => {
      // Arrange
      const currentWorkingDirectory = "/home/nathanwise/Desktop";
      FileSystemUtil.setCurrentWorkingDirectory(currentWorkingDirectory);

      // Act
      await PWD.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        currentWorkingDirectory,
      );
    });

    test("should output the resolved current working directory", async () => {
      // Arrange
      FileSystemUtil.setHomeDirectory("/home/nathanwise/");
      FileSystemUtil.setCurrentWorkingDirectory("~/Desktop");

      // Act
      await PWD.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        "/home/nathanwise/Desktop",
      );
    });

    test("should output the changed current working directory", async () => {
      // Arrange
      const firstCurrentWorkingDirectory = "/home/nathanwise/Desktop";
      FileSystemUtil.setCurrentWorkingDirectory(firstCurrentWorkingDirectory);

      // Act
      await PWD.run([]);

      const secondCurrentWorkingDirectory = "/usr/local/etc";
      FileSystemUtil.setCurrentWorkingDirectory(secondCurrentWorkingDirectory);

      await PWD.run([]);

      // Assert
      expect(appendOutput).toHaveBeenCalledTimes(2);
      expect(appendOutput).toHaveBeenNthCalledWith(
        1,
        firstCurrentWorkingDirectory,
      );
      expect(appendOutput).toHaveBeenNthCalledWith(
        2,
        secondCurrentWorkingDirectory,
      );
    });
  });
});
