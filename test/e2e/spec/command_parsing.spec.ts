import { test } from "../fixture";
import {
  commandNotFound,
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../helper/constant/generic";
import { expectExactTextInElement } from "../helper/util/terminal_util";

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
  await expectExactTextInElement(
    page.locator(outputSelector),
    `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${commandArgs.join(" ")}`,
  );
  await expectExactTextInElement(
    page.locator(promptSelector),
    defaultUserPrompt,
  );
  await expectExactTextInElement(page.locator(inputSelector), "");
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
  await expectExactTextInElement(
    page.locator(outputSelector),
    `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${commandName}${commandNotFound}`,
  );
  await expectExactTextInElement(
    page.locator(promptSelector),
    defaultUserPrompt,
  );
  await expectExactTextInElement(page.locator(inputSelector), "");
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  // Arrange & Act
  await page.locator(inputSelector).press("Enter");

  // Assert
  await expectExactTextInElement(
    page.locator(outputSelector),
    `${defaultInitialPrompt}\n${defaultUserPrompt}`,
  );
  await expectExactTextInElement(
    page.locator(promptSelector),
    defaultUserPrompt,
  );
  await expectExactTextInElement(page.locator(inputSelector), "");
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
  await expectExactTextInElement(page.locator(inputSelector), "");
});
