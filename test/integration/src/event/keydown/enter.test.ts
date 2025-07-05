import { beforeEach, describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CommandUtil from "../../../../../src/util/command_util";
import { processEnter } from "../../../../../src/event/keydown/enter";
import CommandHistoryUtil from "../../../../../src/util/command_history_util";

describe("Enter", () => {
  // Spy
  const executeCommand = vi.spyOn(CommandUtil, "executeCommand");
  const appendText = vi.spyOn(TerminalUtil, "appendText");
  const addToHistory = vi.spyOn(CommandHistoryUtil, "addToHistory");
  const setHistoricCommand = vi.spyOn(CommandHistoryUtil, "setHistoricCommand");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_util");

  beforeEach(() => {
    CommandHistoryUtil.resetHistory();
  });

  describe("without 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown");

    test("executes a command", () => {
      // Arrange & Act
      processEnter(event);

      // Assert
      expect(executeCommand).toHaveBeenCalledOnce();
    });

    test("on user input and no history exists adds command to history, adds a new user input entry, and history index to be 0", () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

      // Act
      processEnter(event);

      // Assert
      expect(addToHistory).toHaveBeenCalledTimes(2);
      expect(addToHistory).toHaveBeenCalledWith(userInput);
      expect(addToHistory).toHaveBeenCalledWith("");
      expect(setHistoricCommand).not.toHaveBeenCalled();
      expect(CommandHistoryUtil.getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual(["", userInput]);
    });

    test("on user input and history exists updates existing user input in history, adds a new user input entry, and history index to be 0", () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

      const existingCommand = "existing command";
      CommandHistoryUtil.addToHistory(existingCommand);
      CommandHistoryUtil.addToHistory("");
      addToHistory.mockReset();

      // Act
      processEnter(event);

      // Assert
      expect(setHistoricCommand).toHaveBeenCalledExactlyOnceWith(userInput);
      expect(addToHistory).toHaveBeenCalledExactlyOnceWith("");
      expect(CommandHistoryUtil.getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual([
        "",
        userInput,
        existingCommand,
      ]);
    });

    test("on previous command, updates the previous command, resets the history index, adds a new user input entry, and history index to be 0", () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

      const existingCommand = "existing command";
      CommandHistoryUtil.addToHistory(existingCommand);
      CommandHistoryUtil.addToHistory("");
      addToHistory.mockReset();

      CommandHistoryUtil.incrementHistoryIndex();

      // Act
      processEnter(event);

      // Assert
      expect(setHistoricCommand).toHaveBeenCalledExactlyOnceWith(userInput);
      expect(addToHistory).toHaveBeenCalledExactlyOnceWith("");
      expect(CommandHistoryUtil.getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual([
        "",
        userInput,
        existingCommand,
      ]);
    });
  });

  describe("with 'Shift'", () => {
    test("appends a newline and does not execute a command", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        shiftKey: true,
      });

      // Act
      processEnter(event);

      // Assert
      expect(appendText).toHaveBeenCalled();
      expect(executeCommand).not.toHaveBeenCalled();
    });

    test("does not add to the command history", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        shiftKey: true,
      });

      // Act
      processEnter(event);

      // Assert
      expect(addToHistory).not.toHaveBeenCalled();
    });
  });
});
