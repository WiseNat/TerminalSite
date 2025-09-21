import { test } from "../../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../../helper/util/terminal_util.ts";

test.describe("Commands that are Corrupted", () => {
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
  ].forEach((command) => {
    test(`${command} should output an error message`, async ({ page }) => {
      // Arrange
      const input = `${command} foo -d --bar baz`;

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(
        page,
        `${input}\n/bin/${command}: Permission denied`,
      );
    });
  });
});
