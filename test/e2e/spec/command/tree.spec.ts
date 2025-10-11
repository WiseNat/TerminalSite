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
  const existingDirectory = "/src";
  const existingEmptyDirectory = "/src/main/nathanwise/.empty";
  const existingFile = "/src/index.ts";

  test("Should show a tree for the current working directory when no argument is given", async ({
    page,
  }) => {
    // Arrange
    const changedDirectory = "/colour";
    const cdInput = `cd ${changedDirectory}`;
    await runCommand(page, cdInput);

    const input = "tree";

    // Act
    await runCommand(page, input);

    // Assert
    const expected =
      "\n/colour\n" +
      "├── archive.zip\n" +
      "├── audio.mp3\n" +
      "├── dir\n" +
      "├── executable.sh\n" +
      "├── image.png\n" +
      "├── normal.txt\n" +
      "└── rubbish.tmp\n" +
      "\n" +
      "2 directories, 6 files";
    await assertExactTextInTerminal(
      page,
      `${COMMAND_RAN_OUTPUT}${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}${expected}`,
      getExpectedPrompt(changedDirectory),
    );
    await checkForColouredSpans(page, {
      directory: 2,
      executables: 1,
      archives: 1,
      graphics: 1,
      audios: 1,
      rubbish: 1,
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
      "\n/src\n" +
      "├── index.ts\n" +
      "└── main\n" +
      "    └── nathanwise\n" +
      "        ├── Desktop\n" +
      "        ├── external\n" +
      "        │   ├── deployed2.md\n" +
      "        │   ├── deployed.md\n" +
      "        │   └── repo.md\n" +
      "        ├── foo\n" +
      "        │   ├── bar\n" +
      "        │   ├── bazzing.gaz\n" +
      "        │   └── daz\n" +
      "        ├── newlines.txt\n" +
      "        └── some_rubbish.tmp\n" +
      "\n" +
      "7 directories, 8 files";
    await assertOutputInTerminal(page, `${input}${expected}`);
    await checkForColouredSpans(page, {
      directory: 7,
      executables: 0,
      archives: 0,
      graphics: 0,
      audios: 0,
      rubbish: 1,
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
    const expected =
      "\n/src/main/nathanwise/.empty\n" + "\n" + "0 directories, 0 files";
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

  test.describe("all flag: -a", () => {
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
        "\n/src\n" +
        "├── index.ts\n" +
        "└── main\n" +
        "    └── nathanwise\n" +
        "        ├── .bashrc\n" +
        "        ├── Desktop\n" +
        "        ├── .empty\n" +
        "        ├── external\n" +
        "        │   ├── deployed2.md\n" +
        "        │   ├── deployed.md\n" +
        "        │   └── repo.md\n" +
        "        ├── foo\n" +
        "        │   ├── bar\n" +
        "        │   ├── bazzing.gaz\n" +
        "        │   └── daz\n" +
        "        ├── .full\n" +
        "        │   ├── aFile\n" +
        "        │   └── someEmptyDir\n" +
        "        ├── newlines.txt\n" +
        "        ├── some_rubbish.tmp\n" +
        "        └── .testing\n" +
        "\n" +
        "10 directories, 11 files";
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, {
        directory: 10,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 1,
      });
    });
  });

  test.describe("directory flag: -d", () => {
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
        "\n/src\n" +
        "└── main\n" +
        "    └── nathanwise\n" +
        "        ├── Desktop\n" +
        "        ├── external\n" +
        "        └── foo\n" +
        "            └── bar\n" +
        "\n" +
        "7 directories";
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, {
        directory: 7,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });

  // Nowhere good to test this
  // test.describe("prune flag: --prune", () => {});

  test.describe("depth flag: -L", () => {
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
        "├── colour\n" +
        "├── downloads\n" +
        "├── etc\n" +
        "├── some\n" +
        "├── src\n" +
        "└── test\n" +
        "\n" +
        "7 directories, 0 files";
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, {
        directory: 7,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });
});
