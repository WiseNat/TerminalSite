import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { processArrowDown } from "../../../../../src/event/keydown_key/arrow_down";
import CommandHistoryUtil from "../../../../../src/util/command_history_util";

describe("ArrowDown", () => {
  // Spy
  const setHistoricCommand = vi.spyOn(CommandHistoryUtil, "setHistoricCommand");
  const setText = vi.spyOn(TerminalUtil, "setText");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_history_util");

  describe("without 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown");

    test("a successful history decrement cycles to a more recent command and modifies the terminal text", () => {
      // Arrange
      const readonlyContent = "idk";
      vi.mocked(TerminalUtil.getReadOnlyContent).mockReturnValue(
        readonlyContent,
      );
      const historicCommand = "something";
      vi.mocked(CommandHistoryUtil.getHistoricCommand).mockReturnValue(
        historicCommand,
      );
      vi.mocked(CommandHistoryUtil.decrementHistoryIndex).mockReturnValue(true);

      // Act
      processArrowDown(event);

      // Assert
      expect(setText).toHaveBeenCalledExactlyOnceWith(
        readonlyContent + historicCommand,
      );
    });

    test("an unsuccessful history decrement does nothing", () => {
      // Arrange
      vi.mocked(CommandHistoryUtil.decrementHistoryIndex).mockReturnValue(
        false,
      );

      // Act
      processArrowDown(event);

      // Assert
      expect(setText).not.toHaveBeenCalled();
    });
  });

  describe("with 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown", {
      shiftKey: true,
    });

    test("does nothing when shift is held down", () => {
      // Arrange & Act
      processArrowDown(event);

      // Assert
      expect(setHistoricCommand).not.toHaveBeenCalled();
    });
  });
});
