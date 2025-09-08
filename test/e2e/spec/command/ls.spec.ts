import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import {
  BLUE,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
} from "../../../../src/constant/colour";
import { Page } from "@playwright/test";

test.describe("Ls", () => {
  // TODO: test cases...
  //  - Flags
  //    - Show all files in CWD when no arg is passed with -a flag
  //    - Show all files in given Dir when a Dir is passed with -a flag
  //    - Show long listing with -l flag
  //    - Show long listing with human readable file size with -lh flag
  //    - Show file size with -s flag
  //    - Show human readable file size file size with -ls flag
  //    - Show one line per file (no columns) with -1 flag
  // TODO: Run this locally to have a good example of how everything works: 'ls ~ ~/Desktop/webstorm.desktop /asdaasdasdasdasd ~/.bashrc /asdasd /'

  const existingDirectory = "/home/nathanwise/Documents";
  const existingEmptyDirectory = "/boot";
  const existingFile = "/etc/hosts";
  const existingDotFile = "~/Projects/this/.external";
  const fakePath = "/some/fake/path";

  interface ColouredCounts {
    directory: number;
    executables: number;
    archives: number;
    graphics: number;
    audios: number;
  }

  function getColouredSpanLocator(colour: string): string {
    return `//span[contains(@style, "color: ${colour}") and contains(@style, "font-weight: bold")]`;
  }

  async function checkForColouredSpans(
    page: Page,
    colouredCounts: ColouredCounts,
  ) {
    await expect(
      page.locator(outputSelector).locator(getColouredSpanLocator(BLUE)),
    ).toHaveCount(colouredCounts.directory);

    await expect(
      page.locator(outputSelector).locator(getColouredSpanLocator(GREEN)),
    ).toHaveCount(colouredCounts.executables);

    await expect(
      page.locator(outputSelector).locator(getColouredSpanLocator(RED)),
    ).toHaveCount(colouredCounts.archives);

    await expect(
      page.locator(outputSelector).locator(getColouredSpanLocator(MAGENTA)),
    ).toHaveCount(colouredCounts.graphics);

    await expect(
      page.locator(outputSelector).locator(getColouredSpanLocator(CYAN)),
    ).toHaveCount(colouredCounts.audios);
  }

  [
    {
      type: "Should show non-dotfiles in the current working directory when no path argument is given",
      args: [],
      expected:
        "\ncontact.txt\tDesktop\tDocuments\tDownloads\thelp.txt\tMusic\tPictures\tProjects\tPublic\tTemplates\tVideos",
      counts: {
        directory: 9,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should show non-dotfiles in the given directory when a Directory path is provided",
      args: [existingDirectory],
      expected: "\nabout.txt\tCV.pdf\tEducation\tskills.md",
      counts: {
        directory: 1,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should show just the non-dotfile file when a non-dotfile File path is provided",
      args: [existingFile],
      expected: "\n/etc/hosts",
      counts: {
        directory: 0,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should show just the dotfile file when a dotfile File path is provided",
      args: [existingDotFile],
      expected: "\n/home/nathanwise/Projects/this/.external",
      counts: {
        directory: 0,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should show an error when an unknown path is provided",
      args: [fakePath],
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory",
      counts: {
        directory: 0,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should output nothing when given a Directory path with no children",
      args: [existingEmptyDirectory],
      expected: "",
      counts: {
        directory: 0,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
    {
      type: "Should output information for each argument when multiple Paths are provided",
      args: [existingDotFile, existingFile, existingDirectory, fakePath],
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n/etc/hosts\t/home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\nabout.txt\tCV.pdf\tEducation\tskills.md",
      counts: {
        directory: 1,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      },
    },
  ].forEach(({ type, args, expected, counts }) => {
    test(type, async ({ page }) => {
      // Arrange
      let input = "ls";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

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

      await checkForColouredSpans(page, counts);
    });
  });

  ["-a", "--all"].forEach((flag) => {
    test(`Should output the entire contents of a directory when the '${flag}' flag is provided`, async ({
      page,
    }) => {
      // Arrange
      const input = `ls ${existingDirectory} ${flag}`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected = "\n.\t..\tabout.txt\tCV.pdf\tEducation\tskills.md\t.tmp";
      await expect(page.locator(outputSelector)).exactTextInElement(
        `${defaultInitialPrompt}\n${defaultUserPrompt}${input}${expected}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      await checkForColouredSpans(page, {
        directory: 3,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
      });
    });
  });
});
