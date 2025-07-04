import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import clear from "../../../../../src/command/scripts/clear";

describe("Clear", () => {
  describe("run", () => {
    // Spy
    const setText = vi.spyOn(TerminalUtil, "setText");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    test("should clear the terminal", () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      clear.run(args);

      // Assert
      expect(setText).toHaveBeenCalledWith("");
    });
  });
});
