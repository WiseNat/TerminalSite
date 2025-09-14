import { expect, test } from "../fixture";
import {
  COMMAND_NOT_FOUND,
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../helper/constant/generic";

test("Typing a valid command and pressing Enter runs that command", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(INPUT_SELECTOR).pressSequentially(input);
  await page.locator(INPUT_SELECTOR).press("Enter");

  // Assert
  await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
    `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\n${commandArgs.join(" ")}`,
  );
  await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
    DEFAULT_USER_PROMPT,
  );
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
});

test("Typing an unknown command and pressing Enter returns that the command was not found", async ({
  page,
}) => {
  // Arrange
  const commandName = "fakecommandthatdoesnotexist";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(INPUT_SELECTOR).pressSequentially(input);
  await page.locator(INPUT_SELECTOR).press("Enter");

  // Assert
  await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
    `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\n${commandName}${COMMAND_NOT_FOUND}`,
  );
  await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
    DEFAULT_USER_PROMPT,
  );
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  // Arrange & Act
  await page.locator(INPUT_SELECTOR).press("Enter");

  // Assert
  await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
    `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}`,
  );
  await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
    DEFAULT_USER_PROMPT,
  );
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
});

test("Pressing Enter should run a command & prevent a newline being inserted in the user input", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(INPUT_SELECTOR).pressSequentially(input);
  await page.locator(INPUT_SELECTOR).press("Enter");

  // Assert
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
});
