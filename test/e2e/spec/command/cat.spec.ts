import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Cat", () => {
  // TODO: test..
  //  - Renders []() as an 'a' tag with a href

  // TODO: Rewrite:
  //  - Pull out .external file path
  //  - Pull out file contents

  // TODO: Remove some of these?.. Unit test should handle most of these.

  test("should output nothing when no args are passed", async ({ page }) => {
    // Arrange
    const input = "cat";

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

  test("should output the contents of a single file, when that file path is given", async ({
    page,
  }) => {
    // Arrange
    const input = "cat ~/Projects/this/.external";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = "github.com/WiseNat/TerminalSite/";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("should output the contents of a multiple files, when multiple file paths are given", async ({
    page,
  }) => {
    // Arrange
    const input = "cat ~/Projects/this/.external ~/Documents/about.txt";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expectedExternal = "github.com/WiseNat/TerminalSite/";
    const expectedAbout =
      "I'm Nathan Wise, someone who loves programming and technology as a whole.\n" +
      "I developed a passion for programming early in 2014 and have continued growing my skills ever since.\n" +
      "\n" +
      "The source code for this website is available [here](https://github.com/WiseNat/TerminalSite/).\n";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedExternal}\n${expectedAbout}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("should output file not found error, when a file path for a non-existent path is given", async ({
    page,
  }) => {
    // Arrange
    const input = "cat ~/Projects/someFakeProject/.external";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected =
      "cat: /home/nathanwise/Projects/someFakeProject/.external: No such file or directory";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("should output file not found error multiple times, when multiple file paths for non-existent paths is given", async ({
    page,
  }) => {
    // Arrange
    const input =
      "cat ~/Projects/someFakeProject/.external /home/fakePath/someFile.txt";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expectedFirst =
      "cat: /home/nathanwise/Projects/someFakeProject/.external: No such file or directory";
    const expectedSecond =
      "cat: /home/fakePath/someFile.txt: No such file or directory";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedFirst}\n${expectedSecond}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });

  test("should output file not found error and found file contents, when multiple existent and non-existent file paths are given", async ({
    page,
  }) => {
    // Arrange
    const input =
      "cat ~/Projects/someFakeProject/.external ~/Projects/this/.external";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expectedFirst =
      "cat: /home/nathanwise/Projects/someFakeProject/.external: No such file or directory";
    const expectedSecond = "github.com/WiseNat/TerminalSite/";

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedFirst}\n${expectedSecond}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});
