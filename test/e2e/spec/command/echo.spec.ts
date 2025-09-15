import { test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const input = "echo foo bar -e baz gaz";

    // Act
    await runCommand(page, input);

    // Assert
    const expected = "foo bar gaz";
    await assertOutputInTerminal(page, `${input}\n${expected}`);
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\n`);
  });
});
