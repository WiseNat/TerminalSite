import { test } from "../../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../../helper/util/terminal_util.ts";

test.describe("Commands that Output Nothing", () => {
  ["true", "false"].forEach((command) => {
    test(`${command} should do nothing`, async ({ page }) => {
      // Arrange
      const input = `${command} foo -d --bar baz`;

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, input);
    });
  });
});
