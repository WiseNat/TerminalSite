import { test } from "../fixture";
import {
  defaultInitialPrompt,
  inputSelector,
  promptSelector,
  outputSelector,
  defaultUserPrompt,
} from "../helper/constant/generic";
import { expectExactTextInElement } from "../helper/util/terminal_util";

// Custom command specific E2E tests are under each command spec

test.describe("Default autocompletion", () => {
  test("autocompletes 'ech' to 'echo '", async ({ page }) => {
    // Arrange
    const input = "ech";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expectExactTextInElement(
      page.locator(outputSelector),
      defaultInitialPrompt,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), `${input}o `);
  });

  test("adds a space when 'echo' has been typed", async ({ page }) => {
    // Arrange
    const input = "echo";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expectExactTextInElement(
      page.locator(outputSelector),
      defaultInitialPrompt,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), `${input} `);
  });

  // TODO: Fix this! This test is WRONG. Echo relies on default autocomplete which now provides file & directory suggestions!
  test("does nothing when 'echo ' has already been typed", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expectExactTextInElement(
      page.locator(outputSelector),
      defaultInitialPrompt,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), input);
  });

  test("does nothing when no text has been inputted", async ({ page }) => {
    // Arrange & Act
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expectExactTextInElement(
      page.locator(outputSelector),
      defaultInitialPrompt,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), "");
  });
});
