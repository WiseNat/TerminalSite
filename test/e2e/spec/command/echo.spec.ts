import { test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const args = "foo bar -e baz gaz";
    const input = `echo ${args}`;

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\n${args}`);
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\n`);
  });

  test("should output a complex series of args", async ({ page }) => {
    // Arrange
    const input = "echo -a sadoas das''a as '\"'";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\n-a sadoas dasa as "`);
  });
});
