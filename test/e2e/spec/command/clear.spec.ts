import { expect, test } from "../../fixture";
import {
  COMMAND_NOT_FOUND,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic";

test.describe("Clear", () => {
  test("should remove all existing outputs", async ({ page }) => {
    // Arrange
    const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";
    const input = "clear";

    // Act
    // Rubbish input first to simulate terminal usage
    await page.locator(INPUT_SELECTOR).pressSequentially(defaultInput);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Actual clear
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement("");
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });

  test("output must not have an extra newline after clearing", async ({
    page,
  }) => {
    // Arrange
    const fakeCommand = "fakecommand";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially("clear");
    await page.locator(INPUT_SELECTOR).press("Enter");
    await page.locator(INPUT_SELECTOR).pressSequentially(fakeCommand);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_USER_PROMPT}${fakeCommand}\n${fakeCommand}${COMMAND_NOT_FOUND}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });
});
