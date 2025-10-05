import { describe, expect, test, vi } from "vitest";
import MORE from "../../../../../../src/command/scripts/fake/more.ts";
import TerminalUtil from "../../../../../../src/util/terminal_util.ts";
import SED from "../../../../../../src/command/scripts/fake/sed.ts";
import SH from "../../../../../../src/command/scripts/fake/sh.ts";
import DATE from "../../../../../../src/command/scripts/fake/date.ts";
import DF from "../../../../../../src/command/scripts/fake/df.ts";
import PS from "../../../../../../src/command/scripts/fake/ps.ts";

describe("Commands that Output Nothing", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../../src/util/terminal_util");

  [
    { command: "date", commandScript: DATE },
    { command: "df", commandScript: DF },
    { command: "more", commandScript: MORE },
    { command: "ps", commandScript: PS },
    { command: "sed", commandScript: SED },
    { command: "sh", commandScript: SH },
  ].forEach(({ command, commandScript }) => {
    test(`${command} should do nothing`, async () => {
      // Arrange
      const args = ["foo", "-d", "--bar", "baz"];

      // Act
      await commandScript.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `/bin/${command}: cannot execute binary file: Exec format error`,
      );
    });
  });
});
