import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import { checkForColouredSpans } from "../../helper/util/element_util.ts";
import { getExpectedPrompt } from "../../helper/util/terminal_util.ts";

test.describe("Tree", () => {
  const existingDirectory = "/home/nathanwise/Documents";
  const existingEmptyDirectory = "/boot";
  const existingFile = "/etc/hosts";

  test("Should show a tree for the current working directory when no argument is given", async ({
    page,
  }) => {
    // Arrange
    const changedDirectory = "/home/nathanwise/Documents/Education";
    const cdInput = `cd ${changedDirectory}`;
    await page.locator(inputSelector).pressSequentially(cdInput);
    await page.locator(inputSelector).press("Enter");

    const input = "tree";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected =
      "\n/home/nathanwise/Documents/Education\n" +
      "├── a_levels.md\n" +
      "├── degree.md\n" +
      "└── gcses.md\n" +
      "\n" +
      "1 directory, 3 files";
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      getExpectedPrompt(changedDirectory),
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkForColouredSpans(page, {
      directory: 1,
      executables: 0,
      archives: 0,
      graphics: 0,
      audios: 0,
      rubbish: 0,
    });
  });

  test("Should show a tree for a directory when a directory argument is given", async ({
    page,
  }) => {
    // Arrange
    const input = `tree ${existingDirectory}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected =
      "\n/home/nathanwise/Documents\n" +
      "├── about.txt\n" +
      "├── CV.pdf\n" +
      "├── Education\n" +
      "│   ├── a_levels.md\n" +
      "│   ├── degree.md\n" +
      "│   └── gcses.md\n" +
      "└── skills.md\n" +
      "\n" +
      "2 directories, 6 files";
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkForColouredSpans(page, {
      directory: 2,
      executables: 0,
      archives: 0,
      graphics: 0,
      audios: 0,
      rubbish: 0,
    });
  });

  test("Should show an empty tree when an empty directory argument is given", async ({
    page,
  }) => {
    // Arrange
    const input = `tree ${existingEmptyDirectory}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = "\n/boot\n" + "\n" + "0 directories, 0 files";
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkForColouredSpans(page, {
      directory: 1,
      executables: 0,
      archives: 0,
      graphics: 0,
      audios: 0,
      rubbish: 0,
    });
  });

  [
    {
      type: "file path",
      arg: `${existingFile}`,
      expected:
        `\n${existingFile}  [error opening dir]\n` +
        "\n" +
        "0 directories, 1 file",
    },
    {
      type: "unknown path",
      arg: "/some/fake/path",
      expected:
        "\n/some/fake/path  [error opening dir]\n" +
        "\n" +
        "0 directories, 0 files",
    },
  ].forEach(({ type, arg, expected }) => {
    test(`Should show an error when ${type} argument is given,`, async ({
      page,
    }) => {
      // Arrange
      const input = `tree ${arg}`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      await checkForColouredSpans(page, {
        directory: 0,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });

  test.describe("-a flag", () => {
    test("Should show a tree including hidden files/dirs when a directory argument is given with a -a flag", async ({
      page,
    }) => {
      // Arrange
      const input = `tree ${existingDirectory} -a`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\n/home/nathanwise/Documents\n" +
        "├── about.txt\n" +
        "├── CV.pdf\n" +
        "├── Education\n" +
        "│   ├── a_levels.md\n" +
        "│   ├── degree.md\n" +
        "│   └── gcses.md\n" +
        "├── skills.md\n" +
        "└── .tmp\n" +
        "\n" +
        "2 directories, 7 files";
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      await checkForColouredSpans(page, {
        directory: 2,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 1,
      });
    });
  });

  test.describe("-d flag", () => {
    test("Should show a directory tree when a directory argument is given with a -d flag", async ({
      page,
    }) => {
      // Arrange
      const input = `tree ${existingDirectory} -d`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\n/home/nathanwise/Documents\n" +
        "└── Education\n" +
        "\n" +
        "2 directories";
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      await checkForColouredSpans(page, {
        directory: 2,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });

  // Nowhere good to test this
  // test.describe("--prune flag", () => {});

  test.describe("-L flag", () => {
    test("Should show a reduced tree when a directory argument is given with a -L 1 flag", async ({
      page,
    }) => {
      // Arrange
      const input = "tree / -L 1";

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\n/\n" +
        "├── bin\n" +
        "├── boot\n" +
        "├── dev\n" +
        "├── etc\n" +
        "├── home\n" +
        "├── lib\n" +
        "├── media\n" +
        "├── mnt\n" +
        "├── opt\n" +
        "├── root\n" +
        "├── run\n" +
        "├── sbin\n" +
        "├── srv\n" +
        "├── tmp\n" +
        "├── usr\n" +
        "└── var\n" +
        "\n" +
        "17 directories, 0 files";
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      await checkForColouredSpans(page, {
        directory: 17,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });
});
