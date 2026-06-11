import { describe, test, expect, vi } from "vitest";
import { processL } from "../../../../../src/event/keydown_key/l.ts";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";

describe("L", () => {
  // Spy
  const clearTerminal = vi.spyOn(TerminalUtil, "clearTerminal");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  describe("processL", async () => {
    test("with 'Ctrl' clears the terminal content", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown", { ctrlKey: true });

      // Act
      await processL(event);

      // Assert
      expect(clearTerminal).toHaveBeenCalledOnce();
    });

    test("without 'Ctrl' does nothing", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown");

      // Act
      await processL(event);

      // Assert
      expect(clearTerminal).not.toHaveBeenCalled();
    });
  });
});
