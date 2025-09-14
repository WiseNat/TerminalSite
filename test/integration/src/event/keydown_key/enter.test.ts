import { beforeEach, describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CommandUtil from "../../../../../src/util/command_util";
import { processEnter } from "../../../../../src/event/keydown_key/enter";
import CommandHistoryUtil from "../../../../../src/util/command_history_util";

describe("Enter", () => {
  // Spy
  const executeCommand = vi.spyOn(CommandUtil, "executeCommand");
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
  const addToHistory = vi.spyOn(CommandHistoryUtil, "addToHistory");
  const setHistoricCommand = vi.spyOn(CommandHistoryUtil, "setHistoricCommand");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_util");

  beforeEach(() => {
    CommandHistoryUtil._resetHistory();
  });

  describe("without 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown");

    test("executes a command", async () => {
      // Arrange & Act
      await processEnter(event);

      // Assert
      expect(executeCommand).toHaveBeenCalledOnce();
    });

    test("on user input and no history exists adds command to history, adds a new user input entry, and history index to be 0", async () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getInput).mockReturnValue(userInput);

      // Act
      await processEnter(event);

      // Assert
      expect(addToHistory).toHaveBeenCalledTimes(2);
      expect(addToHistory).toHaveBeenCalledWith(userInput);
      expect(addToHistory).toHaveBeenCalledWith("");
      expect(setHistoricCommand).not.toHaveBeenCalled();
      expect(CommandHistoryUtil._getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual(["", userInput]);
    });

    test("on user input and history exists updates existing user input in history, adds a new user input entry, and history index to be 0", async () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getInput).mockReturnValue(userInput);

      const existingCommand = "existing command";
      CommandHistoryUtil.addToHistory(existingCommand);
      CommandHistoryUtil.addToHistory("");
      addToHistory.mockReset();

      // Act
      await processEnter(event);

      // Assert
      expect(setHistoricCommand).toHaveBeenCalledExactlyOnceWith(userInput);
      expect(addToHistory).toHaveBeenCalledExactlyOnceWith("");
      expect(CommandHistoryUtil._getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual([
        "",
        userInput,
        existingCommand,
      ]);
    });

    test("on previous command, updates the previous command, resets the history index, adds a new user input entry, and history index to be 0", async () => {
      // Arrange
      const userInput = "foo bar";
      vi.mocked(TerminalUtil.getInput).mockReturnValue(userInput);

      const existingCommand = "existing command";
      CommandHistoryUtil.addToHistory(existingCommand);
      CommandHistoryUtil.addToHistory("");
      addToHistory.mockReset();

      CommandHistoryUtil.incrementHistoryIndex();

      // Act
      await processEnter(event);

      // Assert
      expect(setHistoricCommand).toHaveBeenCalledExactlyOnceWith(userInput);
      expect(addToHistory).toHaveBeenCalledExactlyOnceWith("");
      expect(CommandHistoryUtil._getHistoryIndex()).toEqual(0);
      expect(CommandHistoryUtil.getHistory()).toStrictEqual([
        "",
        userInput,
        existingCommand,
      ]);
    });
  });

  describe("with 'Shift'", () => {
    // Other
    const event = new KeyboardEvent("keydown", {
      shiftKey: true,
    });

    test("appends a newline and does not execute a command", async () => {
      // Arrange & Act
      await processEnter(event);

      // Assert
      expect(appendOutput).not.toHaveBeenCalled();
      expect(executeCommand).not.toHaveBeenCalled();
    });

    test("does not add to the command history", async () => {
      // Arrange & Act
      await processEnter(event);

      // Assert
      expect(addToHistory).not.toHaveBeenCalled();
    });
  });
});
