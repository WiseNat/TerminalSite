import { expect, test } from "../../fixture";
import {
  commandNotFound,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Clear", () => {
  test("should remove all existing outputs", async ({ page }) => {
    // Arrange
    const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";
    const input = "clear";

    // Act
    // Rubbish input first to simulate terminal usage
    await page.locator(inputSelector).pressSequentially(defaultInput);
    await page.locator(inputSelector).press("Enter");

    // Actual clear
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement("");
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("output must not have an extra newline after clearing", async ({
    page,
  }) => {
    // Arrange
    const fakeCommand = "fakecommand";

    // Act
    await page.locator(inputSelector).pressSequentially("clear");
    await page.locator(inputSelector).press("Enter");
    await page.locator(inputSelector).pressSequentially(fakeCommand);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultUserPrompt}${fakeCommand}\n${fakeCommand}${commandNotFound}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});
