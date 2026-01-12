import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../../src/util/terminal_util.ts";
import CommandUtil from "../../../../../../src/util/command_util.ts";

describe("Commands that the User has no Permissions to Execute", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../../src/util/terminal_util");

  [
    "chgrp",
    "chmod",
    "chown",
    "cp",
    "dd",
    "dmesg",
    "kill",
    "ln",
    "login",
    "mkdir",
    "mknod",
    "mount",
    "mv",
    "rm",
    "rmdir",
    "stty",
    "su",
    "sudo",
    "sync",
    "unmount",
  ].forEach((commandName) => {
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
