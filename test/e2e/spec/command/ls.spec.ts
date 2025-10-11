import { test } from "../../fixture";
import { INPUT_SELECTOR } from "../../helper/constant/generic";
import { checkForColouredSpans } from "../../helper/util/element_util.ts";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";
import { isMobileProject } from "../../helper/util/playwright_util.ts";

test.describe("Ls", () => {
  const existingDirectory = "/colour";
  const existingEmptyDirectory = "/src/main/nathanwise/.empty";
  const existingFile = "/src/index.ts";
  const existingDotFile = "~/.bashrc";
  const fakePath = "/some/fake/path";

  [
    {
      type: "Should show non-dotfiles in the current working directory when no path argument is given",
      args: [],
      desktopExpected:
        "\nDesktop  external  foo  newlines.txt  some_rubbish.tmp",
      mobileExpected:
        "\nDesktop   foo           some_rubbish.tmp" +
        "\nexternal  newlines.txt",
      counts: {
        directory: 3,
        executables: 0,
        archives: 0,
        graphics: 0,
        audios: 0,
        rubbish: 1,
      },
    },
    {
      type: "Should show non-dotfiles in the given directory when a Directory path is provided",
      args: [existingDirectory],
      desktopExpected:
        "\narchive.zip  audio.mp3  dir  executable.sh  image.png  normal.txt  rubbish.tmp",
      mobileExpected:
        "\narchive.zip  executable.sh  rubbish.tmp" +
        "\naudio.mp3    image.png" +
        "\ndir          normal.txt",
      counts: {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      },
    },
    {
      type: "Should show just the non-dotfile file when a non-dotfile File path is provided",
      args: [existingFile],
      desktopExpected: `\n${existingFile}`,
      mobileExpected: `\n${existingFile}`,
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
      desktopExpected: "\n/src/main/nathanwise/.bashrc",
      mobileExpected: "\n/src/main/nathanwise/.bashrc",
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
      desktopExpected: `\nls: cannot access '${fakePath}': No such file or directory`,
      mobileExpected: `\nls: cannot access '${fakePath}': No such file or directory`,
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
      desktopExpected: "",
      mobileExpected: "",
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
      type: "Should output information for each argument when an Unknown Path and Directory are provided",
      args: [existingDirectory, fakePath],
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        "\n/colour:" +
        "\narchive.zip  audio.mp3  dir  executable.sh  image.png  normal.txt  rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        "\n/colour:" +
        "\narchive.zip  executable.sh  rubbish.tmp" +
        "\naudio.mp3    image.png" +
        "\ndir          normal.txt",
      counts: {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      },
    },
    {
      type: "Should output information for each argument when multiple Paths are provided",
      args: [existingDotFile, existingFile, existingDirectory, fakePath],
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}  /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\narchive.zip  audio.mp3  dir  executable.sh  image.png  normal.txt  rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}` +
        "\n/src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\narchive.zip  executable.sh  rubbish.tmp" +
        "\naudio.mp3    image.png" +
        "\ndir          normal.txt",
      counts: {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      },
    },
  ].forEach(({ type, args, desktopExpected, mobileExpected, counts }) => {
    test(type, async ({ page }, testInfo) => {
      // Arrange
      let input = "ls";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

      // Act
      await runCommand(page, input);

      // Assert
      if (isMobileProject(testInfo)) {
        await assertOutputInTerminal(page, `${input}${mobileExpected}`);
      } else {
        await assertOutputInTerminal(page, `${input}${desktopExpected}`);
      }

      await checkForColouredSpans(page, counts);
    });
  });

  ["-a", "--all"].forEach((flag) => {
    test.describe(`all flag: ${flag}`, () => {
      test(`Should output all files including dotfiles when the '${flag}' flag is provided with a directory arg`, async ({
        page,
      }, testInfo) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const desktopExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n${existingFile}  /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\n.  ..  archive.zip  audio.mp3  dir  executable.sh  image.png  normal.txt  rubbish.tmp";

        const mobileExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n${existingFile}` +
          "\n/src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\n.            audio.mp3      image.png" +
          "\n..           dir            normal.txt" +
          "\narchive.zip  executable.sh  rubbish.tmp";

        if (isMobileProject(testInfo)) {
          await assertOutputInTerminal(page, `${input}${mobileExpected}`);
        } else {
          await assertOutputInTerminal(page, `${input}${desktopExpected}`);
        }

        await checkForColouredSpans(page, {
          directory: 3,
          executables: 1,
          archives: 1,
          graphics: 1,
          audios: 1,
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
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    const expected =
      `\nls: cannot access '${fakePath}': No such file or directory` +
      `\n${existingFile}\n/src/main/nathanwise/.bashrc` +
      `\n\n${existingDirectory}:` +
      "\narchive.zip\naudio.mp3\ndir\nexecutable.sh\nimage.png\nnormal.txt\nrubbish.tmp";
    await assertOutputInTerminal(page, `${input}${expected}`);
    await checkForColouredSpans(page, {
      directory: 1,
      executables: 1,
      archives: 1,
      graphics: 1,
      audios: 1,
      rubbish: 1,
    });
  });

  ["-s", "--size"].forEach((flag) => {
    test.describe(`size flag: ${flag}`, () => {
      test(`Should output the contents of a directory with their block sizes when the '${flag}' flag is provided`, async ({
        page,
      }, testInfo) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const desktopExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}  12 /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52" +
          "\n8 archive.zip  8 audio.mp3  4 dir  8 executable.sh  8 image.png  8 normal.txt  8 rubbish.tmp";

        const mobileExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}` +
          "\n12 /src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52" +
          "\n8 archive.zip    8 image.png" +
          "\n8 audio.mp3      8 normal.txt" +
          "\n4 dir            8 rubbish.tmp" +
          "\n8 executable.sh";

        if (isMobileProject(testInfo)) {
          await assertOutputInTerminal(page, `${input}${mobileExpected}`);
        } else {
          await assertOutputInTerminal(page, `${input}${desktopExpected}`);
        }

        await checkForColouredSpans(page, {
          directory: 1,
          executables: 1,
          archives: 1,
          graphics: 1,
          audios: 1,
          rubbish: 1,
        });
      });

      test(`Should output the contents of a directory with increased total blocks when the '${flag}' & 'a'`, async ({
        page,
      }, testInfo) => {
        // Arrange
        const input = `ls ${flag} -a ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const desktopExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}  12 /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 56" +
          "\n4 .  0 ..  8 archive.zip  8 audio.mp3  4 dir  8 executable.sh  8 image.png  8 normal.txt  8 rubbish.tmp";

        const mobileExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}` +
          "\n12 /src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\ntotal: 56" +
          "\n4 .            8 executable.sh" +
          "\n0 ..           8 image.png" +
          "\n8 archive.zip  8 normal.txt" +
          "\n8 audio.mp3    8 rubbish.tmp" +
          "\n4 dir";

        if (isMobileProject(testInfo)) {
          await assertOutputInTerminal(page, `${input}${mobileExpected}`);
        } else {
          await assertOutputInTerminal(page, `${input}${desktopExpected}`);
        }

        await checkForColouredSpans(page, {
          directory: 3,
          executables: 1,
          archives: 1,
          graphics: 1,
          audios: 1,
          rubbish: 1,
        });
      });
    });
  });

  ["-h", "--human-readable"].forEach((flag) => {
    test.describe(`human-readable flag: ${flag}`, () => {
      test("Should replace Block Size with File Size when -h and -s are present", async ({
        page,
      }, testInfo) => {
        // Arrange
        const input = `ls -sh ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const desktopExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8K ${existingFile}  12K /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52K" +
          "\n8K archive.zip  8K audio.mp3  4K dir  8K executable.sh  8K image.png  8K normal.txt  8K rubbish.tmp";

        const mobileExpected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8K ${existingFile}` +
          "\n12K /src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52K" +
          "\n8K archive.zip    8K image.png" +
          "\n8K audio.mp3      8K normal.txt" +
          "\n4K dir            8K rubbish.tmp" +
          "\n8K executable.sh";

        if (isMobileProject(testInfo)) {
          await assertOutputInTerminal(page, `${input}${mobileExpected}`);
        } else {
          await assertOutputInTerminal(page, `${input}${desktopExpected}`);
        }

        await checkForColouredSpans(page, {
          directory: 1,
          executables: 1,
          archives: 1,
          graphics: 1,
          audios: 1,
          rubbish: 1,
        });
      });

      test("Should replace Block Size with File Size when -h and -l are present", async ({
        page,
      }) => {
        // Arrange
        const input = `ls -lh ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const expected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 ${existingFile}` +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t1K Oct 11 20:47 /src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52K" +
          "\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 archive.zip" +
          "\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 audio.mp3" +
          "\ndrwxr-xr-x 2 root root\t4K Oct 11 20:47 dir" +
          "\n-rwxrwxrwx 1 root root\t1K Oct 11 20:47 executable.sh" +
          "\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 image.png" +
          "\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 normal.txt" +
          "\n-rw-rw-r-- 1 root root\t1K Oct 11 20:47 rubbish.tmp";
        await assertOutputInTerminal(page, `${input}${expected}`);
        await checkForColouredSpans(page, {
          directory: 1,
          executables: 1,
          archives: 1,
          graphics: 1,
          audios: 1,
          rubbish: 1,
        });
      });
    });
  });

  test.describe("block-size flag: --block-size", () => {
    test("Does nothing when only the --block-size flag is provided", async ({
      page,
    }, testInfo) => {
      // Arrange
      const input = `ls --block-size=2048 ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
      const desktopExpected =
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}  /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\narchive.zip  audio.mp3  dir  executable.sh  image.png  normal.txt  rubbish.tmp";

      const mobileExpected =
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}` +
        "\n/src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\narchive.zip  executable.sh  rubbish.tmp" +
        "\naudio.mp3    image.png" +
        "\ndir          normal.txt";

      if (isMobileProject(testInfo)) {
        await assertOutputInTerminal(page, `${input}${mobileExpected}`);
      } else {
        await assertOutputInTerminal(page, `${input}${desktopExpected}`);
      }

      await checkForColouredSpans(page, {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      });
    });
  });

  [
    {
      flags: ["-s"],
      blockSize: 1,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}  12288 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip  8192 audio.mp3  4096 dir  8192 executable.sh  8192 image.png  8192 normal.txt  8192 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}` +
        "\n12288 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip    8192 image.png" +
        "\n8192 audio.mp3      8192 normal.txt" +
        "\n4096 dir            8192 rubbish.tmp" +
        "\n8192 executable.sh",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 1,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}  12288 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip  8192 audio.mp3  4096 dir  8192 executable.sh  8192 image.png  8192 normal.txt  8192 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}` +
        "\n12288 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip    8192 image.png" +
        "\n8192 audio.mp3      8192 normal.txt" +
        "\n4096 dir            8192 rubbish.tmp" +
        "\n8192 executable.sh",
    },
    {
      flags: ["-s"],
      blockSize: 512,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n16 ${existingFile}  24 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n16 archive.zip  16 audio.mp3  8 dir  16 executable.sh  16 image.png  16 normal.txt  16 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n16 ${existingFile}` +
        "\n24 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n16 archive.zip    16 image.png" +
        "\n16 audio.mp3      16 normal.txt" +
        "\n8 dir             16 rubbish.tmp" +
        "\n16 executable.sh",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 2048,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n4 ${existingFile}  6 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n4 archive.zip  4 audio.mp3  2 dir  4 executable.sh  4 image.png  4 normal.txt  4 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n4 ${existingFile}` +
        "\n6 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n4 archive.zip    4 image.png" +
        "\n4 audio.mp3      4 normal.txt" +
        "\n2 dir            4 rubbish.tmp" +
        "\n4 executable.sh",
    },
    {
      flags: ["-l"],
      blockSize: 1,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 1,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
    },
    {
      flags: ["-l"],
      blockSize: 512,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t8 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t8 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 2048,
      desktopExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t2 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
      mobileExpected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t2 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp",
    },
  ].forEach(({ flags, blockSize, desktopExpected, mobileExpected }) => {
    test(`Should alter the Block Size of Files when ${flags} is present with block size ${blockSize}`, async ({
      page,
    }, testInfo) => {
      // Arrange
      const input = `ls ${flags.join(" ")} --block-size=${blockSize} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
      if (isMobileProject(testInfo)) {
        await assertOutputInTerminal(page, `${input}${mobileExpected}`);
      } else {
        await assertOutputInTerminal(page, `${input}${desktopExpected}`);
      }

      await checkForColouredSpans(page, {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      });
    });
  });

  test.describe("long flag: -l", () => {
    test("Should output information in the long file format", async ({
      page,
    }) => {
      // Arrange
      const input = `ls -l ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
      const expected =
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 52" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp";
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      });
    });

    test("Should override the -1 flag", async ({ page }) => {
      // Arrange
      const input = `ls -l ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
      const expected =
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Oct 11 20:47 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 52" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Oct 11 20:47 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Oct 11 20:47 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Oct 11 20:47 rubbish.tmp";
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
      });
    });
  });
});
