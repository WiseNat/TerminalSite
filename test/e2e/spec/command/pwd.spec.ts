import { expect, test } from "../../fixture";
import {
  DEFAULT_CURRENT_WORKING_DIRECTORY,
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic";
import { getExpectedPrompt } from "../../helper/util/terminal_util";

test.describe("Pwd", () => {
  test("should output the current working directory", async ({ page }) => {
    // Arrange
    const input = "pwd";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\n${DEFAULT_CURRENT_WORKING_DIRECTORY}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });

  test("should output the changed current working directory when the current working directory is changed", async ({
    page,
  }) => {
    // Arrange
    const changedDirectory = "/usr/local/etc";
    const cdInput = `cd ${changedDirectory}`;
    await page.locator(INPUT_SELECTOR).pressSequentially(cdInput);
    await page.locator(INPUT_SELECTOR).press("Enter");

    const input = "pwd";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}\n${changedDirectory}`,
    );
  });
});
