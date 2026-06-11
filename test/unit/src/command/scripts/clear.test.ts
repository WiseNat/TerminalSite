import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CLEAR from "../../../../../src/command/scripts/clear";

describe("Clear", () => {
  // Spy
  const clearTerminal = vi.spyOn(TerminalUtil, "clearTerminal");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  describe("run", () => {
    test("should clear the terminal", async () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      await CLEAR.run(args);

      // Assert
      expect(clearTerminal).toHaveBeenCalledOnce();
    });
  });
});
