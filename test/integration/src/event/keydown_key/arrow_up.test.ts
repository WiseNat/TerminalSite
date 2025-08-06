import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { processArrowUp } from "../../../../../src/event/keydown_key/arrow_up";
import CommandHistoryUtil from "../../../../../src/util/command_history_util";

describe("ArrowUp", () => {
  // Spy
  const setHistoricCommand = vi.spyOn(CommandHistoryUtil, "setHistoricCommand");
  const setInput = vi.spyOn(TerminalUtil, "setInput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_history_util");

  describe("without 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown");

    test("a successful history increment cycles to the previous command and modifies the terminal text", async () => {
      // Arrange
      const historicCommand = "something";
      vi.mocked(CommandHistoryUtil.getHistoricCommand).mockReturnValue(
        historicCommand,
      );
      vi.mocked(CommandHistoryUtil.incrementHistoryIndex).mockReturnValue(true);

      // Act
      await processArrowUp(event);

      // Assert
      expect(setInput).toHaveBeenCalledExactlyOnceWith(historicCommand);
    });

    test("an unsuccessful history increment does nothing", async () => {
      // Arrange
      vi.mocked(CommandHistoryUtil.incrementHistoryIndex).mockReturnValue(
        false,
      );

      // Act
      await processArrowUp(event);

      // Assert
      expect(setInput).not.toHaveBeenCalled();
    });
  });

  describe("with 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown", {
      shiftKey: true,
    });

    test("does nothing when shift is held down", async () => {
      // Arrange & Act
      await processArrowUp(event);

      // Assert
      expect(setHistoricCommand).not.toHaveBeenCalled();
    });
  });
});
