import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../../src/util/terminal_util.ts";
import CHGRP from "../../../../../../src/command/scripts/fake/chgrp.ts";
import CHMOD from "../../../../../../src/command/scripts/fake/chmod.ts";
import CHOWN from "../../../../../../src/command/scripts/fake/chown.ts";
import CP from "../../../../../../src/command/scripts/fake/cp.ts";
import DD from "../../../../../../src/command/scripts/fake/dd.ts";
import DMESG from "../../../../../../src/command/scripts/fake/dmesg.ts";
import KILL from "../../../../../../src/command/scripts/fake/kill.ts";
import LN from "../../../../../../src/command/scripts/fake/ln.ts";
import LOGIN from "../../../../../../src/command/scripts/fake/login.ts";
import MKDIR from "../../../../../../src/command/scripts/fake/mkdir.ts";
import MKNOD from "../../../../../../src/command/scripts/fake/mknod.ts";
import MOUNT from "../../../../../../src/command/scripts/fake/mount.ts";
import MV from "../../../../../../src/command/scripts/fake/mv.ts";
import RM from "../../../../../../src/command/scripts/fake/rm.ts";
import RMDIR from "../../../../../../src/command/scripts/fake/rmdir.ts";
import STTY from "../../../../../../src/command/scripts/fake/stty.ts";
import SU from "../../../../../../src/command/scripts/fake/su.ts";
import SYNC from "../../../../../../src/command/scripts/fake/sync.ts";
import UNMOUNT from "../../../../../../src/command/scripts/fake/unmount.ts";
import SUDO from "../../../../../../src/command/scripts/fake/sudo.ts";

describe("Commands that the User has no Permissions to Execute", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../../src/util/terminal_util");

  [
    { command: "chgrp", commandScript: CHGRP },
    { command: "chmod", commandScript: CHMOD },
    { command: "chown", commandScript: CHOWN },
    { command: "cp", commandScript: CP },
    { command: "dd", commandScript: DD },
    { command: "dmesg", commandScript: DMESG },
    { command: "kill", commandScript: KILL },
    { command: "ln", commandScript: LN },
    { command: "login", commandScript: LOGIN },
    { command: "mkdir", commandScript: MKDIR },
    { command: "mknod", commandScript: MKNOD },
    { command: "mount", commandScript: MOUNT },
    { command: "mv", commandScript: MV },
    { command: "rm", commandScript: RM },
    { command: "rmdir", commandScript: RMDIR },
    { command: "stty", commandScript: STTY },
    { command: "su", commandScript: SU },
    { command: "sudo", commandScript: SUDO },
    { command: "sync", commandScript: SYNC },
    { command: "unmount", commandScript: UNMOUNT },
  ].forEach(({ command, commandScript }) => {
    test(`${command} should do nothing`, async () => {
      // Arrange
      const args = ["foo", "-d", "--bar", "baz"];

      // Act
      await commandScript.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `\n/bin/${command}: Permission denied`,
      );
    });
  });
});
