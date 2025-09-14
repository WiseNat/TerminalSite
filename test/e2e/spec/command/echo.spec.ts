import { expect, test } from "../../fixture";
import {
  DEFAULT_USER_PROMPT,
  DEFAULT_INITIAL_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const input = "echo foo bar -e baz gaz";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    const expected = "foo bar gaz";

    await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\n${expected}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });
});
