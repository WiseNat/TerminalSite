import { expect, test } from "../../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import {
  BLACK,
  BLUE,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
} from "../../../../src/constant/colour";
import { Page } from "@playwright/test";

test.describe("Ls", () => {
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
    rubbish: number;
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

    await expect(
      page
        .locator(outputSelector)
        .locator(`//span[contains(@style, "color: ${BLACK}")]`),
    ).toHaveCount(colouredCounts.rubbish);
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
        rubbish: 0,
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
        rubbish: 0,
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
        rubbish: 0,
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
        rubbish: 0,
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
        rubbish: 0,
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
        rubbish: 0,
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
        rubbish: 0,
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
    test.describe(`${flag} flag`, () => {
      test(`Should output all files including dotfiles when the '${flag}' flag is provided with a directory arg`, async ({
        page,
      }) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(inputSelector).pressSequentially(input);
        await page.locator(inputSelector).press("Enter");

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory" +
          "\n/etc/hosts\t/home/nathanwise/Projects/this/.external" +
          "\n\n/home/nathanwise/Documents:" +
          "\n.\t..\tabout.txt\tCV.pdf\tEducation\tskills.md\t.tmp";
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
          rubbish: 1,
        });
      });
    });
  });

  test("Should output everything on newlines when the '1' flag is provided", async ({
    page,
  }) => {
    // Arrange
    const input = `ls -1 ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected =
      "\nls: cannot access '/some/fake/path': No such file or directory" +
      "\n/etc/hosts\n/home/nathanwise/Projects/this/.external" +
      "\n\n/home/nathanwise/Documents:" +
      "\nabout.txt\nCV.pdf\nEducation\nskills.md";
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

  ["-s", "--size"].forEach((flag) => {
    test.describe(`${flag} flag`, () => {
      test(`Should output the contents of a directory with their block sizes when the '${flag}' flag is provided`, async ({
        page,
      }) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(inputSelector).pressSequentially(input);
        await page.locator(inputSelector).press("Enter");

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory\n" +
          "12 /etc/hosts\t12 /home/nathanwise/Projects/this/.external\n\n" +
          "/home/nathanwise/Documents:\n" +
          "total: 320\n" +
          "12 about.txt\t292 CV.pdf\t4 Education\t12 skills.md";
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

      test(`Should output the contents of a directory with increased total blocks when the '${flag}' & 'a'`, async ({
        page,
      }) => {
        // Arrange
        const input = `ls ${flag} -a ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(inputSelector).pressSequentially(input);
        await page.locator(inputSelector).press("Enter");

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory\n" +
          "12 /etc/hosts\t12 /home/nathanwise/Projects/this/.external\n\n" +
          "/home/nathanwise/Documents:\n" +
          "total: 340\n" +
          "4 .\t4 ..\t12 about.txt\t292 CV.pdf\t4 Education\t12 skills.md\t12 .tmp";
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
          rubbish: 1,
        });
      });
    });
  });

  ["-h", "--human-readable"].forEach((flag) => {
    test.describe(`${flag} flag`, () => {
      test("Should replace Block Size with File Size when -h and -s are present", async ({
        page,
      }) => {
        // Arrange
        const input = `ls -sh ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(inputSelector).pressSequentially(input);
        await page.locator(inputSelector).press("Enter");

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory\n" +
          "12K /etc/hosts\t12K /home/nathanwise/Projects/this/.external\n\n" +
          "/home/nathanwise/Documents:\n" +
          "total: 320K\n" +
          "12K about.txt\t292K CV.pdf\t4K Education\t12K skills.md";
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

      test("Should replace Block Size with File Size when -h and -l are present", async ({
        page,
      }) => {
        // Arrange
        const input = `ls -lh ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(inputSelector).pressSequentially(input);
        await page.locator(inputSelector).press("Enter");

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory" +
          "\n-rw-rw-r-- 1 root root\t1K Aug 17 00:28 /etc/hosts" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t1K Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
          "\n\n/home/nathanwise/Documents:" +
          "\ntotal: 320K" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t1K Jul 21 00:50 about.txt" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t282K Jul 21 00:50 CV.pdf" +
          "\ndrw-rw-r-- 2 nathanwise nathanwise\t4K Aug 17 00:33 Education" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t1K Jul 21 00:50 skills.md";
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
    });
  });

  test.describe("--block-size flag", () => {
    test("Does nothing when only a --block-size flag is provided", async ({
      page,
    }) => {
      // Arrange
      const input = `ls --block-size=2048 ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n/etc/hosts\t/home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\nabout.txt\tCV.pdf\tEducation\tskills.md";
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
  });

  [
    {
      flags: ["-s"],
      blockSize: 1,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory\n" +
        "12288 /etc/hosts\t12288 /home/nathanwise/Projects/this/.external\n\n" +
        "/home/nathanwise/Documents:\n" +
        "total: 327680\n" +
        "12288 about.txt\t299008 CV.pdf\t4096 Education\t12288 skills.md",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 1,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory\n" +
        "12288 /etc/hosts\t12288 /home/nathanwise/Projects/this/.external\n\n" +
        "/home/nathanwise/Documents:\n" +
        "total: 327680\n" +
        "12288 about.txt\t299008 CV.pdf\t4096 Education\t12288 skills.md",
    },
    {
      flags: ["-s"],
      blockSize: 512,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory\n" +
        "24 /etc/hosts\t24 /home/nathanwise/Projects/this/.external\n\n" +
        "/home/nathanwise/Documents:\n" +
        "total: 640\n" +
        "24 about.txt\t584 CV.pdf\t8 Education\t24 skills.md",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 2048,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory\n" +
        "6 /etc/hosts\t6 /home/nathanwise/Projects/this/.external\n\n" +
        "/home/nathanwise/Documents:\n" +
        "total: 160\n" +
        "6 about.txt\t146 CV.pdf\t2 Education\t6 skills.md",
    },
    {
      flags: ["-l"],
      blockSize: 1,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t51 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t84 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 327680" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t272 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t288626 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t4096 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t375 Jul 21 00:50 skills.md",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 1,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t51 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t84 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 327680" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t272 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t288626 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t4096 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t375 Jul 21 00:50 skills.md",
    },
    {
      flags: ["-l"],
      blockSize: 512,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t1 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 640" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t564 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t8 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Jul 21 00:50 skills.md",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 2048,
      expected:
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t1 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 160" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t141 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t2 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Jul 21 00:50 skills.md",
    },
  ].forEach(({ flags, blockSize, expected }) => {
    test(`Should alter the Block Size of Files when ${flags} is present with block size ${blockSize}`, async ({
      page,
    }) => {
      // Arrange
      const input = `ls ${flags.join(" ")} --block-size=${blockSize} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

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
        directory: 1,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 0,
      });
    });
  });

  test.describe("-l flag", () => {
    test("Should output information in the long file format", async ({
      page,
    }) => {
      // Arrange
      const input = `ls -l ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t51 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t84 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 320" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t272 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t288626 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t4096 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t375 Jul 21 00:50 skills.md";
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

    test("Should override the -1 flag", async ({ page }) => {
      // Arrange
      const input = `ls -l ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Enter");

      // Assert
      const expected =
        "\nls: cannot access '/some/fake/path': No such file or directory" +
        "\n-rw-rw-r-- 1 root root\t51 Aug 17 00:28 /etc/hosts" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t84 Aug 17 00:33 /home/nathanwise/Projects/this/.external" +
        "\n\n/home/nathanwise/Documents:" +
        "\ntotal: 320" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t272 Jul 21 00:50 about.txt" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t288626 Jul 21 00:50 CV.pdf" +
        "\ndrw-rw-r-- 2 nathanwise nathanwise\t4096 Aug 17 00:33 Education" +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t375 Jul 21 00:50 skills.md";
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
  });
});
