import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Cat", () => {
  const existingFiles = [
    {
      path: "/etc/hosts",
      content: "127.0.0.1\tlocalhost\n" + "127.0.1.1\tnathan-wise-portfolio",
    },
    {
      path: "~/Documents/Education/gcses.md",
      content:
        "# GCSEs\n" +
        "\n" +
        "## Summary\n" +
        "\n" +
        "I completed my GCSES in June 2019 at Debden Park High School.\n" +
        "\n" +
        "## Subjects & Grades\n" +
        "\n" +
        "| Subject                            | Grade | Board           | QN         |\n" +
        "|------------------------------------|-------|-----------------|------------|\n" +
        "| Mathematics                        | 9     | Pearson Edexcel | 601/4700/3 |\n" +
        "| Computer Science                   | 8     | OCR             | 601/8355/X |\n" +
        "| Physics                            | 8     | OCR             | 601/8685/9 |\n" +
        "| Biology                            | 8     | OCR             | 601/8506/5 |\n" +
        "| Chemistry                          | 7     | OCR             | 601/8605/7 |\n" +
        "| Geography                          | 6     | AQA             | 601/8410/3 |\n" +
        "| English Literature                 | 6     | AQA             | 601/4447/6 |\n" +
        "| English Language                   | 5     | AQA             | 601/4292/3 |\n" +
        "| English Language (Spoken Language) | Merit | AQA             | 601/4292/3 |\n",
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

  const urlFiles = [
    {
      path: "~/Projects/this/.external",
      text: "https://github.com/WiseNat/TerminalSite/",
      href: "https://github.com/WiseNat/TerminalSite/",
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

  test("should output an 'a' element when reading a file with a Markdown URL", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${urlFiles[0].path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = urlFiles[0].text;

    await expect(page.locator(outputSelector)).elementToStartWith(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    const link = page
      .locator(outputSelector)
      .locator(`a[href="${urlFiles[0].href}"]`, { hasText: urlFiles[0].text });
    await expect(link).toHaveCount(1);
    await expect(link).toBeVisible();
  });
});
