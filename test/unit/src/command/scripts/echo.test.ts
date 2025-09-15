import { describe, expect, test, vi } from "vitest";
import ECHO from "../../../../../src/command/scripts/echo";
import TerminalUtil from "../../../../../src/util/terminal_util";

describe("Echo", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  describe("run", async () => {
    test("should join and append all args", async () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      await ECHO.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith("\nfoo bar");
    });

    test("should append nothing when no args are provided", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await ECHO.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith("\n");
    });

    test("should not options when outputting", async () => {
      // Arrange
      const args = ["foo", "bar", "-a", "baz", "--gaz"];

      // Act
      await ECHO.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith("\nfoo bar -a baz --gaz");
    });
  });
});
