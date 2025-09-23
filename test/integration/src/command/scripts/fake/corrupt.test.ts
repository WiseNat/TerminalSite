import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../../src/util/terminal_util.ts";
import CommandUtil from "../../../../../../src/util/command_util.ts";

describe("Commands that are Corrupted", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../../src/util/terminal_util");

  ["date", "df", "more", "ps", "sed", "sh"].forEach((commandName) => {
    test("should run with CommandUtil", () => {
      // Act & Assert
      expect(
        async () => await CommandUtil.executeCommand(commandName),
      ).not.toThrowError();

      expect(appendOutput).not.toHaveBeenCalledWith(
        `\n${commandName}: command not found`,
      );
    });
  });
});
