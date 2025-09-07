import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

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
  // TODO: somehow parameterise the above with flags into no arg, directory arg, file arg?

  const existingDirectory = "/home/nathanwise/Documents";
  const existingEmptyDirectory = "/boot";
  const existingFile = "/etc/hosts";
  const existingDotFile = "~/Projects/this/.external";
  const fakePath = "/some/fake/path";

  // TODO: update with coloured text
  [
    {
      type: "Should show non-dotfiles in the current working directory when no path argument is given",
      args: [],
      expected:
        "\ncontact.txt\tDesktop\tDocuments\tDownloads\thelp.txt\tMusic\tPictures\tProjects\tPublic\tTemplates\tVideos",
    },
    {
      type: "Should show non-dotfiles in the given directory when a Directory path is provided",
      args: [existingDirectory],
      expected: "\nabout.txt\tCV.pdf\tEducation\tskills.md",
    },
    {
      type: "Should show just the non-dotfile file when a non-dotfile File path is provided",
      args: [existingFile],
      expected: "\n/etc/hosts",
    },
    {
      type: "Should show just the dotfile file when a dotfile File path is provided",
      args: [existingDotFile],
      expected: "\n/home/nathanwise/Projects/this/.external",
    },
    {
      type: "Should show an error when an unknown path is provided",
      args: [fakePath],
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory",
    },
    {
      type: "Should output nothing when given a Directory path with no children",
      args: [existingEmptyDirectory],
      expected: "",
    },
    {
      type: "Should output information for each argument when multiple Paths are provided",
      args: [existingDotFile, existingFile, existingDirectory, fakePath],
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n/etc/hosts\t/home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\nabout.txt\tCV.pdf\tEducation\tskills.md",
    },
  ].forEach(({ type, args, expected }) => {
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
    });
  });
});
