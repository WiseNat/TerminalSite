import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../../src/util/command_util";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { mockExtractVisibleText } from "../../../../unit/helper/mocks.ts";

// Mocks
vi.mock("../../../../../src/util/terminal_util");
vi.mock("../../../../../src/util/html_util");

describe("Neofetch", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  mockExtractVisibleText();

  test("should run with CommandUtil", () => {
    // Arrange
    const commandName = "neofetch";

    // Act & Assert
    expect(
      async () => await CommandUtil.executeCommand(commandName),
    ).not.toThrowError();

    expect(appendOutput).not.toHaveBeenCalledWith(
      `\n${commandName}: command not found`,
    );
  });
});
