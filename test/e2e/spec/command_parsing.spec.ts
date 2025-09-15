import { expect, test } from "../fixture";
import { COMMAND_NOT_FOUND, INPUT_SELECTOR } from "../helper/constant/generic";
import {
  assertExactTextInTerminal,
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
  await assertExactTextInTerminal(page, `${input}\n${commandArgs.join(" ")}`);
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
  await assertExactTextInTerminal(
    page,
    `${input}\n${commandName}${COMMAND_NOT_FOUND}`,
  );
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  // Arrange & Act
  await runCommand(page, "");

  // Assert
  await assertExactTextInTerminal(page, "");
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
