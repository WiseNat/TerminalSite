import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Pwd", () => {
  test("should output the current working directory", async ({ page }) => {
    // Arrange
    const input = "pwd";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = "/home/nathanwise";

    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  // TODO: Check this passes when cd is implemented.
  test.fixme(
    "should output the changed current working directory when the current working directory is changed",
    async ({ page }) => {
      // Arrange
      const changedDirectory = "/usr/local/etc";
      const cdInput = `cd ${changedDirectory}`;
      await page.locator(inputSelector).pressSequentially(cdInput);
      await page.locator(inputSelector).press("Enter");

      const input = "pwd";

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${cdInput}\n${defaultUserPrompt}${input}\n${changedDirectory}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");
    },
  );
});
