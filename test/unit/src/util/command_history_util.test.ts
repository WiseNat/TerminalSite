import { beforeEach, describe, expect, test } from "vitest";
import CommandHistoryUtil from "../../../../src/util/command_history_util";

beforeEach(() => {
  CommandHistoryUtil.resetHistory();
  CommandHistoryUtil.resetHistoryIndex();
});

describe("CommandHistoryUtil", () => {
  describe("resetHistory", () => {
    test("resets the history when nothing has been changed", () => {
      // Arrange & Act
      CommandHistoryUtil.resetHistory();

      // Assert
      const history = CommandHistoryUtil.getHistory();
      expect(history).toStrictEqual([]);
    });

    test("resets the history when commands have been added", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.resetHistory();

      // Assert
      const history = CommandHistoryUtil.getHistory();
      expect(history).toStrictEqual([]);
    });

    test("resets the history index", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.resetHistory();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toStrictEqual(0);
    });
  });

  describe("resetHistoryIndex", () => {
    test("resets the history index when nothing has been changed", () => {
      // Arrange & Act
      CommandHistoryUtil.resetHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toEqual(0);
    });

    test("resets the history index when commands have been added and incremented", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();

      // Act
      CommandHistoryUtil.resetHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toEqual(0);
    });
  });

  describe("incrementHistoryIndex", () => {
    test("increments when the history index is currently within the array bounds", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.incrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(1);
    });

    test("does not exceed the upper edge of the array bounds", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(2);
    });

    test("does nothing when there is no history", () => {
      // Arrange & Act
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(0);
    });
  });

  describe("decrementHistoryIndex", () => {
    test("decrements when the history index is currently within the array bounds", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.decrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(0);
    });

    test("does not exceed the lower edge of the array bounds", () => {
      // Arrange
      CommandHistoryUtil.addToHistory("FOO");
      CommandHistoryUtil.addToHistory("BAR");
      CommandHistoryUtil.addToHistory("userinput");

      // Act
      CommandHistoryUtil.decrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(0);
    });

    test("does nothing when there is no history", () => {
      // Arrange & Act
      CommandHistoryUtil.decrementHistoryIndex();
      CommandHistoryUtil.decrementHistoryIndex();

      // Assert
      const historyIndex = CommandHistoryUtil.getHistoryIndex();
      expect(historyIndex).toBeDefined();
      expect(historyIndex).toEqual(0);
    });
  });

  describe("addToHistory", () => {
    test("appends a new command to the front of the history", () => {
      // Arrange
      const firstCommand = "firstCommand";
      const secondCommand = "secondCommand";

      // Assert
      CommandHistoryUtil.addToHistory(firstCommand);
      CommandHistoryUtil.addToHistory(secondCommand);

      // Act
      const history = CommandHistoryUtil.getHistory();
      expect(history).toStrictEqual([secondCommand, firstCommand]);
    });
  });

  describe("getHistoricCommand", () => {
    test("returns the most recent command", () => {
      // Arrange
      const command = "mycommand";
      CommandHistoryUtil.addToHistory(command);

      // Act
      const historicCommand = CommandHistoryUtil.getHistoricCommand();

      // Assert
      expect(historicCommand).toEqual(command);
    });

    test("returns the previous command when incremented", () => {
      // Arrange
      const firstCommand = "firstCommand";
      CommandHistoryUtil.addToHistory(firstCommand);

      const secondCommand = "secondCommand";
      CommandHistoryUtil.addToHistory(secondCommand);

      CommandHistoryUtil.incrementHistoryIndex();

      // Act
      const historicCommand = CommandHistoryUtil.getHistoricCommand();

      // Assert
      expect(historicCommand).toEqual(firstCommand);
    });

    test("returns the most recent command when incremented and then decremented", () => {
      // Arrange
      const firstCommand = "firstCommand";
      CommandHistoryUtil.addToHistory(firstCommand);

      const secondCommand = "secondCommand";
      CommandHistoryUtil.addToHistory(secondCommand);

      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.decrementHistoryIndex();

      // Act
      const historicCommand = CommandHistoryUtil.getHistoricCommand();

      // Assert
      expect(historicCommand).toEqual(secondCommand);
    });

    test("returns undefined when no history exists", () => {
      // Arrange & Act
      const historicCommand = CommandHistoryUtil.getHistoricCommand();

      // Assert
      expect(historicCommand).toBeUndefined();
    });
  });

  describe("setHistoricCommand", () => {
    test("overrides an existing historic command", () => {
      // Arrange
      const firstCommand = "firstCommand";
      CommandHistoryUtil.addToHistory(firstCommand);

      const secondCommand = "secondCommand";
      CommandHistoryUtil.addToHistory(secondCommand);

      // Act
      const overwrittenValue = "some other value";
      CommandHistoryUtil.setHistoricCommand(overwrittenValue);

      // Assert
      const historicCommand = CommandHistoryUtil.getHistoricCommand();
      expect(historicCommand).toEqual(overwrittenValue);
    });

    test("retains modifications to an existing historic command when the command history is incremented and decremented", () => {
      // Arrange
      const firstCommand = "firstCommand";
      CommandHistoryUtil.addToHistory(firstCommand);

      const secondCommand = "secondCommand";
      CommandHistoryUtil.addToHistory(secondCommand);

      // Act
      const overwrittenValue = "some other value";
      CommandHistoryUtil.incrementHistoryIndex();
      CommandHistoryUtil.setHistoricCommand(overwrittenValue);
      CommandHistoryUtil.decrementHistoryIndex();
      CommandHistoryUtil.incrementHistoryIndex();

      // Assert
      const historicCommand = CommandHistoryUtil.getHistoricCommand();
      expect(historicCommand).toEqual(overwrittenValue);
    });

    test("updates the most recent command when no history exists", () => {
      // Arrange
      const overwrittenValue = "some other value";

      // Act & Assert
      expect(() => {
        CommandHistoryUtil.setHistoricCommand(overwrittenValue);
      }).not.toThrowError();

      const historicCommand = CommandHistoryUtil.getHistoricCommand();
      expect(historicCommand).toEqual(overwrittenValue);
    });
  });
});
