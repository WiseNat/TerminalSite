import { describe, expect, test, vi } from "vitest";
import { echo } from "../../../../src/command/scripts/echo";
import TerminalUtil from "../../../../src/util/terminal_util";

describe("Echo", () => {
  describe("run", () => {
    // Spy
    const appendText = vi.spyOn(TerminalUtil, "appendText");

    // Mock
    vi.mock("../../../../src/util/terminal_util");

    test("should join and append all args", () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      echo.run(args);

      // Assert
      expect(appendText).toHaveBeenCalledWith("\nfoo bar");
    });

    test("should append nothing when no args are provided", () => {
      // Arrange
      const args: string[] = [];

      // Act
      echo.run(args);

      // Assert
      expect(appendText).toHaveBeenCalledWith("\n");
    });

    test("should ignore options when outputting", () => {
      // Arrange
      const args = ["foo", "bar", "-a", "baz", "-gaz"];

      // Act
      echo.run(args);

      // Assert
      expect(appendText).toHaveBeenCalledWith("\nfoo bar");
    });
  });
});
