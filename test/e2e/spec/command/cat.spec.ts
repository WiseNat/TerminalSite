import { expect, test } from "../../fixture";
import { OUTPUT_SELECTOR } from "../../helper/constant/generic";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Cat", () => {
  const existingFiles = [
    {
      path: "/etc/data.txt",
      content:
        "rcu1dwGX0YqNKgRZjHjegXBdcPWuRGpb\n" +
        "qdx4MIyPa79xhmyh9RiSv1tvcNqeJr5Y\n" +
        "QPUxauVt418Osnb6c2xFsJxzQqPuCT9x",
    },
    {
      path: "~/.bashrc",
      content:
        "# ~/.bashrc: executed by bash(1) for non-login shells.\n" +
        "# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)\n" +
        "# for examples",
    },
  ];

  const fakeFiles = [
    {
      path: "~/Projects/someFakeProject/.external",
      resolvedPath: "/src/main/nathanwise/Projects/someFakeProject/.external",
    },
    {
      path: "/home/fakePath/someFile.txt",
      resolvedPath: "/home/fakePath/someFile.txt",
    },
  ];

  const urlFiles = [
    {
      path: "~/external/repo.md",
      text: "https://github.com/WiseNat/TerminalSite/",
      href: "https://github.com/WiseNat/TerminalSite/",
      content:
        "Here's the repo to my site: https://github.com/WiseNat/TerminalSite/",
    },
    {
      path: "~/external/deployed.md",
      text: "nathanwise.tech",
      href: "https://nathanwise.tech/",
      content:
        "The URL nathanwise.tech is where my site is hosted (http if v1 is the current deployment)",
    },
    {
      path: "~/external/deployed2.md",
      text: "nathanwise.software",
      href: "https://nathanwise.software/",
      content:
        "And nathanwise.software is a domain that just redirects to the same deployed site.\nAlso HTTP if V1 is currently deployed.",
    },
  ];

  test("should output nothing when no args are passed", async ({ page }) => {
    // Arrange
    const input = "cat";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, input);
  });

  test("should output the contents of a single file, when that file path is given", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${existingFiles[0].path}`;

    // Act
    await runCommand(page, input);

    // Assert
    const expected = `\n${existingFiles[0].content}`;
    await assertOutputInTerminal(page, input + expected);
  });

  test("should output the contents of a multiple files, when multiple file paths are given", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${existingFiles[0].path} ${existingFiles[1].path}`;

    // Act
    await runCommand(page, input);

    // Assert
    const expected = `\n${existingFiles[0].content}\n${existingFiles[1].content}`;
    await assertOutputInTerminal(page, input + expected);
  });

  test("should output file not found error, when a file path for a non-existent path is given", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${fakeFiles[0].path}`;

    // Act
    await runCommand(page, input);

    // Assert
    const expected = `\ncat: ${fakeFiles[0].resolvedPath}: No such file or directory`;
    await assertOutputInTerminal(page, input + expected);
  });

  test("should output file not found error multiple times, when multiple file paths for non-existent paths is given", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${fakeFiles[0].path} ${fakeFiles[1].path}`;

    // Act
    await runCommand(page, input);

    // Assert
    const expectedFirst = `cat: ${fakeFiles[0].resolvedPath}: No such file or directory`;
    const expectedSecond = `cat: ${fakeFiles[1].resolvedPath}: No such file or directory`;
    const expected = `\n${expectedFirst}\n${expectedSecond}`;
    await assertOutputInTerminal(page, input + expected);
  });

  test("should output file not found error and found file contents, when multiple existent and non-existent file paths are given", async ({
    page,
  }) => {
    // Arrange
    const input = `cat ${fakeFiles[0].path} ${existingFiles[0].path}`;

    // Act
    await runCommand(page, input);

    // Assert
    const expectedFirst = `cat: ${fakeFiles[0].resolvedPath}: No such file or directory`;
    const expectedSecond = existingFiles[0].content;
    const expected = `\n${expectedFirst}\n${expectedSecond}`;
    await assertOutputInTerminal(page, input + expected);
  });

  test("should output an error message when a path is for a directory", async ({
    page,
  }) => {
    // Arrange
    const input = "cat ~/Desktop";

    // Act
    await runCommand(page, input);

    // Assert
    const expected = "\ncat: /src/main/nathanwise/Desktop: Is a directory";
    await assertOutputInTerminal(page, input + expected);
  });

  urlFiles.forEach(({ path, text, href, content }) => {
    test(`should output an 'a' element when reading '${path}' with a Markdown URL`, async ({
      page,
    }) => {
      // Arrange
      const input = `cat ${path}`;

      // Act
      await runCommand(page, input);

      // Assert
      const expected = `\n${content}`;
      await assertOutputInTerminal(page, input + expected);

      const link = page.locator(OUTPUT_SELECTOR).locator(`a[href="${href}"]`, {
        hasText: text,
      });
      await expect(link).toHaveCount(1);
      await expect(link).toBeVisible();
    });
  });
});
