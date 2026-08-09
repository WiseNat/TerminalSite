import { expect, test } from "../fixture";
import { COMMAND_NOT_FOUND, INPUT_SELECTOR } from "../helper/constant/generic";
import {
  assertOutputInTerminal,
  runCommand,
} from "../helper/util/terminal_util.ts";

test("Typing a valid command and pressing Enter runs that command", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await runCommand(page, input);

  // Assert
  await assertOutputInTerminal(page, `${input}\n${commandArgs.join(" ")}`);
});

test("Typing an unknown command and pressing Enter returns that the command was not found", async ({
  page,
}) => {
  // Arrange
  const commandName = "fakecommandthatdoesnotexist";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await runCommand(page, input);

  // Assert
  await assertOutputInTerminal(
    page,
    `${input}\n${commandName}${COMMAND_NOT_FOUND}`,
  );
});

test("Typing HTML and pressing Enter returns that the command was not found", async ({
  page,
}) => {
  // Arrange
  const input = "<a href=\"https://www.nathanwise.software\">My site!</a>";

  // Act
  await runCommand(page, input);

  // Assert
  await assertOutputInTerminal(page, `${input}\n<a${COMMAND_NOT_FOUND}`);
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  // Arrange & Act
  await runCommand(page, "");

  // Assert
  await assertOutputInTerminal(page, "");
});

test("Typing a command with lexer issues and pressing Enter should output an error", async ({
  page,
}) => {
  // Arrange
  const input = "echo 'foo";

  // Act
  await runCommand(page, input);

  // Assert
  await assertOutputInTerminal(
    page,
    `${input}\nsyntax error: unexpected EOF while looking for a matching '`,
  );
});

test("Typing a command with newlines treats and pressing Enter should include those newlines", async ({
  page,
}) => {
  // Arrange
  const insertNewline = async () => {
    await page.keyboard.down("Shift");
    await page.locator(INPUT_SELECTOR).press("Enter");
    await page.keyboard.up("Shift");
  };

  // Act
  // Cannot use runCommand as to enter newlines you need to use Shift+Return
  await page.locator(INPUT_SELECTOR).pressSequentially("echo foo");
  await insertNewline();
  await page.locator(INPUT_SELECTOR).pressSequentially("bar");
  await insertNewline();
  await page.locator(INPUT_SELECTOR).pressSequentially("baz");
  await page.locator(INPUT_SELECTOR).press("Enter");

  // Assert
  await assertOutputInTerminal(page, "echo foo\nbar\nbaz\nfoo\nbar\nbaz");
});

test("Pressing Enter should run a command & prevent a newline being inserted in the user input", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await runCommand(page, input);

  // Assert
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
});
