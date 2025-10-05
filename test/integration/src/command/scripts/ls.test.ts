import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../../src/util/command_util";
import TerminalUtil from "../../../../../src/util/terminal_util";

describe("Ls", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/formatter_util");

  test("should run with CommandUtil", () => {
    // Arrange
    const commandName = "ls";

    // Act & Assert
    expect(
      async () => await CommandUtil.executeCommand(commandName),
    ).not.toThrowError();

    expect(appendOutput).not.toHaveBeenCalledWith(
      `\n${commandName}: command not found`,
    );
  });
});
