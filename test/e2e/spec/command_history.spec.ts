import { test } from "../fixture";
import { terminalSelector } from "../helper/constant/generic";
import { expectTerminalToEndWithText } from "../helper/util/terminal_util";

test.describe("with existing command history", () => {
  const commands: string[] = [
    "echo foo bar",
    "clear",
    "echo -e baz --gaz",
    "asasdasd",
    "git commit -m \"foo 'bar'\" and 'baz \"gaz'",
  ];

  test.beforeEach(async ({ page }) => {
    // Insert commands...
    for (const command of commands) {
      await page.locator(terminalSelector).pressSequentially(command);
      await page.locator(terminalSelector).press("Enter");
    }
  });

  test("pressing 'Up' goes to the previously submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("ArrowUp");

    // Assert
    await expectTerminalToEndWithText(page, commands[commands.length - 1]);
  });

  test("pressing 'Up' twice goes to the previously submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("ArrowUp");
    await page.locator(terminalSelector).press("ArrowUp");

    // Assert
    await expectTerminalToEndWithText(page, commands[commands.length - 2]);
  });

  test("pressing 'Down' goes to a more recently submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("ArrowUp");
    await page.locator(terminalSelector).press("ArrowUp");
    await page.locator(terminalSelector).press("ArrowDown");

    // Assert
    await expectTerminalToEndWithText(page, commands[commands.length - 1]);
  });

  test("pressing 'Up' and then 'Down' from the user input returns to the original user input", async ({
    page,
  }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(terminalSelector).pressSequentially(userInput);

    // Act
    await page.locator(terminalSelector).press("ArrowUp");
    await page.locator(terminalSelector).press("ArrowDown");

    // Assert
    await expectTerminalToEndWithText(page, userInput);
  });

  test("pressing 'Down' from the user input does nothing", async ({ page }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(terminalSelector).pressSequentially(userInput);

    // Act
    await page.locator(terminalSelector).press("ArrowDown");

    // Assert
    await expectTerminalToEndWithText(page, userInput);
  });

  test("typing data in a previously submitted command and returning to that retains the typed data", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("ArrowUp");
    const userInput = "some extra data";
    await page.locator(terminalSelector).pressSequentially(userInput);
    await page.locator(terminalSelector).press("ArrowDown");
    await page.locator(terminalSelector).press("ArrowUp");

    // Assert
    await expectTerminalToEndWithText(
      page,
      commands[commands.length - 1] + userInput,
    );
  });

  test("typing data in a previous submitted command and submitting it adds it as a new user input but does not retain the typed data in the previous command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("ArrowUp");
    const userInput = "some extra data";
    await page.locator(terminalSelector).pressSequentially(userInput);
    await page.locator(terminalSelector).press("Enter");

    // Assert
    await page.locator(terminalSelector).press("ArrowUp");
    await expectTerminalToEndWithText(
      page,
      commands[commands.length - 1] + userInput,
    );
    await page.locator(terminalSelector).press("ArrowUp");
    await expectTerminalToEndWithText(page, commands[commands.length - 1]);
  });
});

test.describe("without existing command history", () => {
  test("pressing 'Up' with no command history does nothing", async ({
    page,
  }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(terminalSelector).pressSequentially(userInput);

    // Act
    await page.locator(terminalSelector).press("ArrowUp");

    // Assert
    await expectTerminalToEndWithText(page, userInput);
  });
});

test.describe("does not interact with the command history", () => {
  test("pressing 'Shift+Up' moves the caret upwards", () => {});
  test("pressing 'Shift+Down' moves the caret downwards", () => {});
});
