import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CLEAR from "../../../../../src/command/scripts/clear";

describe("Clear", () => {
  describe("run", () => {
    // Spy
    const setOutput = vi.spyOn(TerminalUtil, "setOutput");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    test("should clear the terminal", async () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      await CLEAR.run(args);

      // Assert
      expect(setOutput).toHaveBeenCalledWith("");
    });
  });
});
