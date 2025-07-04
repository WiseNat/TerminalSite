import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import CommandUtil from "../../../../../src/util/command_util";
import { processEnter } from "../../../../../src/event/keydown/enter";

describe("Enter", () => {
  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_util");

  test("executes a command", () => {
    // Arrange
    const executeCommand = vi.spyOn(CommandUtil, "executeCommand");
    const event = new KeyboardEvent("keydown");

    // Act
    processEnter(event);

    // Assert
    expect(executeCommand).toHaveBeenCalled();
  });

  test("with 'Shift' appends a newline", () => {
    // Arrange
    const appendText = vi.spyOn(TerminalUtil, "appendText");
    const event = new KeyboardEvent("keydown", {
      shiftKey: true,
    });

    // Act
    processEnter(event);

    // Assert
    expect(appendText).toHaveBeenCalled();
  });
});
