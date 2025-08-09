import { expect, test } from "../../fixture";
import {
  defaultUserPrompt,
  defaultInitialPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const input = "echo foo bar -e baz gaz";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = "foo bar gaz";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});
