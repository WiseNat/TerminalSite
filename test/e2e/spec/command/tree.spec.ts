import { test } from "../../fixture";
import {
  COMMAND_RAN_OUTPUT,
  INPUT_SELECTOR,
} from "../../helper/constant/generic";
import { checkForColouredSpans } from "../../helper/util/element_util.ts";
import {
  assertExactTextInTerminal,
  assertOutputInTerminal,
  getExpectedPrompt,
  runCommand,
} from "../../helper/util/terminal_util.ts";

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
    await runCommand(page, cdInput);

    const input = "tree";

    // Act
    await runCommand(page, input);

    // Assert
    const expected =
      "\n/home/nathanwise/Documents/Education\n" +
      "├── a_levels.md\n" +
      "├── degree.md\n" +
      "└── gcses.md\n" +
      "\n" +
      "1 directory, 3 files";
    await assertExactTextInTerminal(
      page,
      `${COMMAND_RAN_OUTPUT}${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}${expected}`,
      getExpectedPrompt(changedDirectory),
    );
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
    await runCommand(page, input);

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
    await assertOutputInTerminal(page, `${input}${expected}`);
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
    await runCommand(page, input);

    // Assert
    const expected = "\n/boot\n" + "\n" + "0 directories, 0 files";
    await assertOutputInTerminal(page, `${input}${expected}`);
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
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Enter");

      // Assert
      await assertOutputInTerminal(page, `${input}${expected}`);
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
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Enter");

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
      await assertOutputInTerminal(page, `${input}${expected}`);
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
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Enter");

      // Assert
      const expected =
        "\n/home/nathanwise/Documents\n" +
        "└── Education\n" +
        "\n" +
        "2 directories";
      await assertOutputInTerminal(page, `${input}${expected}`);
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
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Enter");

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
      await assertOutputInTerminal(page, `${input}${expected}`);
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
