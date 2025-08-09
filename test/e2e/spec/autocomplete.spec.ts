import { expect, test } from "../fixture";
import {
  defaultInitialPrompt,
  inputSelector,
  promptSelector,
  outputSelector,
  defaultUserPrompt,
} from "../helper/constant/generic";

// Custom command specific E2E tests are under each command spec

test.describe("Default autocompletion", () => {
  test("autocompletes 'ech' to 'echo '", async ({ page }) => {
    // Arrange
    const input = "ech";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(`${input}o `);
  });

  test("adds a space when 'echo' has been typed", async ({ page }) => {
    // Arrange
    const input = "echo";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(`${input} `);
  });

  test("does nothing when no text has been inputted", async ({ page }) => {
    // Arrange & Act
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("provides root directories when '/' has been typed", async ({
    page,
  }) => {
    // Arrange
    const input = "/";
    const expectedOutput =
      "bin/\tboot/\tdev/\tetc/\thome/\tlib/\tmedia/\tmnt/\topt/\troot/\trun/\tsbin/\tsrv/\ttmp/\tusr/\tvar/";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedOutput}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(input);
  });
});
