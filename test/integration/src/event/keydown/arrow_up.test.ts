import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { processArrowUp } from "../../../../../src/event/keydown/arrow_up";
import CommandHistoryUtil from "../../../../../src/util/command_history_util";

describe("ArrowUp", () => {
  // Spy
  const setText = vi.spyOn(TerminalUtil, "setText");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_history_util");

  // Other
  const event = new KeyboardEvent("keydown");

  test("a successful history increment cycles to the previous command and modifies the terminal text", () => {
    // Arrange
    const readonlyContent = "idk";
    vi.mocked(TerminalUtil.getReadOnlyContent).mockReturnValue(readonlyContent);
    const historicCommand = "something";
    vi.mocked(CommandHistoryUtil.getHistoricCommand).mockReturnValue(
      historicCommand,
    );
    vi.mocked(CommandHistoryUtil.incrementHistoryIndex).mockReturnValue(true);

    // Act
    processArrowUp(event);

    // Assert
    expect(setText).toHaveBeenCalledExactlyOnceWith(
      readonlyContent + historicCommand,
    );
  });

  test("an unsuccessful history increment does nothing", () => {
    // Arrange
    vi.mocked(CommandHistoryUtil.incrementHistoryIndex).mockReturnValue(false);

    // Act
    processArrowUp(event);

    // Assert
    expect(setText).not.toHaveBeenCalled();
  });
});
