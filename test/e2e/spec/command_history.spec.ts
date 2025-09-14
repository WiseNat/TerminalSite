import { expect, test } from "../fixture";
import {
  INPUT_SELECTOR,
  PROMPT_SELECTOR,
  DEFAULT_USER_PROMPT,
} from "../helper/constant/generic";

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
      await page.locator(INPUT_SELECTOR).pressSequentially(command);
      await page.locator(INPUT_SELECTOR).press("Enter");
    }
  });

  test("pressing 'Up' goes to the previously submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 1],
    );
  });

  test("pressing 'Up' twice goes to the previously submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    await page.locator(INPUT_SELECTOR).press("ArrowUp");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 2],
    );
  });

  test("pressing 'Down' goes to a more recently submitted command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    await page.locator(INPUT_SELECTOR).press("ArrowDown");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 1],
    );
  });

  test("pressing 'Up' and then 'Down' from the user input returns to the original user input", async ({
    page,
  }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(INPUT_SELECTOR).pressSequentially(userInput);

    // Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    await page.locator(INPUT_SELECTOR).press("ArrowDown");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(userInput);
  });

  test("pressing 'Down' from the user input does nothing", async ({ page }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(INPUT_SELECTOR).pressSequentially(userInput);

    // Act
    await page.locator(INPUT_SELECTOR).press("ArrowDown");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(userInput);
  });

  test("typing data in a previously submitted command and returning to that retains the typed data", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    const userInput = "some extra data";
    await page.locator(INPUT_SELECTOR).pressSequentially(userInput);
    await page.locator(INPUT_SELECTOR).press("ArrowDown");
    await page.locator(INPUT_SELECTOR).press("ArrowUp");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 1] + userInput,
    );
  });

  test("typing data in a previous submitted command and submitting it adds it as a new user input but does not retain the typed data in the previous command", async ({
    page,
  }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    const userInput = "some extra data";
    await page.locator(INPUT_SELECTOR).pressSequentially(userInput);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 1] + userInput,
    );

    await page.locator(INPUT_SELECTOR).press("ArrowUp");
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
      commands[commands.length - 1],
    );
  });

  test.describe("does not interact with the command history", () => {
    test("pressing 'Shift+Up' moves the caret upwards and the current command does not get cycled", async ({
      page,
    }) => {
      // Arrange
      const content = await page.locator(INPUT_SELECTOR).textContent();

      // Act
      await page.keyboard.down("Shift");
      await page.locator(INPUT_SELECTOR).press("ArrowUp");
      await page.keyboard.up("Shift");

      // Assert
      // No check for output as commands significantly alter it.
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(content!);
    });

    test("pressing 'Shift+Down' moves the caret downwards and the current command does not get cycled", async ({
      page,
    }) => {
      // Arrange
      await page.keyboard.press("ArrowUp"); // moving up to have history to move back down to
      const content = await page.locator(INPUT_SELECTOR).textContent();

      // Act
      await page.keyboard.down("Shift");
      await page.locator(INPUT_SELECTOR).press("ArrowDown");
      await page.keyboard.up("Shift");

      // Assert
      // No check for output as commands significantly alter it.
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(content!);
    });
  });
});

test.describe("without existing command history", () => {
  test("pressing 'Up' with no command history does nothing", async ({
    page,
  }) => {
    // Arrange
    const userInput = "some --fake=command example";
    await page.locator(INPUT_SELECTOR).pressSequentially(userInput);

    // Act
    await page.locator(INPUT_SELECTOR).press("ArrowUp");

    // Assert
    // No check for output as commands significantly alter it.
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(userInput);
  });
});
