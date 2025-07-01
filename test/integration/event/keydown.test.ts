import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../src/util/terminal_util";
import { keydown } from "../../../src/event/keydown";
import CommandUtil from "../../../src/util/command_util";

describe("Keydown Event", () => {
  vi.mock("../../../src/util/terminal_util");
  vi.mock("../../../src/util/command_util");

  describe("keydown", () => {
    test("'Enter' executes a command", () => {
      // Arrange
      const executeCommand = vi.spyOn(CommandUtil, "executeCommand");
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
      });

      // Act
      keydown(event);

      // Assert
      expect(executeCommand).toHaveBeenCalled();
    });

    test("'Shift+Enter' appends a newline", () => {
      // Arrange
      const appendText = vi.spyOn(TerminalUtil, "appendText");
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
      });

      // Act
      keydown(event);

      // Assert
      expect(appendText).toHaveBeenCalled();
    });
  });
});
