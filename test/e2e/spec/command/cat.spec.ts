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

  const existingFiles = [
    {
      path: "~/Projects/this/.external",
      content: "github.com/WiseNat/TerminalSite/",
    },
    {
      path: "~/Documents/about.txt",
      content:
        "I'm Nathan Wise, someone who loves programming and technology as a whole.\n" +
        "I developed a passion for programming early in 2014 and have continued growing my skills ever since.\n" +
        "\n" +
        "The source code for this website is available [here](https://github.com/WiseNat/TerminalSite/).\n",
    },
  ];

  const fakeFiles = [
    {
      path: "~/Projects/someFakeProject/.external",
      resolvedPath: "/home/nathanwise/Projects/someFakeProject/.external",
    },
    {
      path: "/home/fakePath/someFile.txt",
      resolvedPath: "/home/fakePath/someFile.txt",
    },
  ];

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
    const input = `cat ${existingFiles[0].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = existingFiles[0].content;

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
    const input = `cat ${existingFiles[0].path} ${existingFiles[1].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${existingFiles[0].content}\n${existingFiles[1].content}`,
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
    const input = `cat ${fakeFiles[0].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = `cat: ${fakeFiles[0].resolvedPath}: No such file or directory`;

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
    const input = `cat ${fakeFiles[0].path} ${fakeFiles[1].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expectedFirst = `cat: ${fakeFiles[0].resolvedPath}: No such file or directory`;
    const expectedSecond = `cat: ${fakeFiles[1].resolvedPath}: No such file or directory`;

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
    const input = `cat ${fakeFiles[0].path} ${existingFiles[0].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expectedFirst = `cat: ${fakeFiles[0].resolvedPath}: No such file or directory`;
    const expectedSecond = existingFiles[0].content;

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedFirst}\n${expectedSecond}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});
