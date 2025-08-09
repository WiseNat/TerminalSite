import { expect, test } from "../fixture";
import {
  commandNotFound,
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../helper/constant/generic";

test("Typing a valid command and pressing Enter runs that command", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(inputSelector).pressSequentially(input);
  await page.locator(inputSelector).press("Enter");

  // Assert
  await expect(page.locator(outputSelector)).exactTextInElement(
    `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${commandArgs.join(" ")}`,
  );
  await expect(page.locator(promptSelector)).exactTextInElement(
    defaultUserPrompt,
  );
  await expect(page.locator(inputSelector)).exactTextInElement("");
});

test("Typing an unknown command and pressing Enter returns that the command was not found", async ({
  page,
}) => {
  // Arrange
  const commandName = "fakecommandthatdoesnotexist";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(inputSelector).pressSequentially(input);
  await page.locator(inputSelector).press("Enter");

  // Assert
  await expect(page.locator(outputSelector)).exactTextInElement(
    `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${commandName}${commandNotFound}`,
  );
  await expect(page.locator(promptSelector)).exactTextInElement(
    defaultUserPrompt,
  );
  await expect(page.locator(inputSelector)).exactTextInElement("");
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  // Arrange & Act
  await page.locator(inputSelector).press("Enter");

  // Assert
  await expect(page.locator(outputSelector)).exactTextInElement(
    `${defaultInitialPrompt}\n${defaultUserPrompt}`,
  );
  await expect(page.locator(promptSelector)).exactTextInElement(
    defaultUserPrompt,
  );
  await expect(page.locator(inputSelector)).exactTextInElement("");
});

test("Pressing Enter should run a command & prevent a newline being inserted in the user input", async ({
  page,
}) => {
  // Arrange
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  // Act
  await page.locator(inputSelector).pressSequentially(input);
  await page.locator(inputSelector).press("Enter");

  // Assert
  await expect(page.locator(inputSelector)).exactTextInElement("");
});
