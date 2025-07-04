import { test } from "../fixture";
import { defaultReadOnly, terminalSelector } from "../helper/constant/generic";
import { expectExactTextInTerminal } from "../helper/util/terminal_util";

// Custom command specific E2E tests are under each command spec

test.describe("Default autocompletion", () => {
  test("autocompletes 'ech' to 'echo '", async ({ page }) => {
    // Arrange
    const input = "ech";

    // Act
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Tab");

    // Assert
    await expectExactTextInTerminal(page, `${defaultReadOnly + input}o `);
  });

  test("adds a space when 'echo' has been typed", async ({ page }) => {
    // Arrange
    const input = "echo";

    // Act
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Tab");

    // Assert
    await expectExactTextInTerminal(page, `${defaultReadOnly + input} `);
  });

  test("does nothing when 'echo ' has already been typed", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Tab");

    // Assert
    await expectExactTextInTerminal(page, `${defaultReadOnly + input}`);
  });

  test("does nothing when no text has been inputted", async ({ page }) => {
    // Arrange & Act
    await page.locator(terminalSelector).press("Tab");

    // Assert
    await expectExactTextInTerminal(page, `${defaultReadOnly}`);
  });
});
