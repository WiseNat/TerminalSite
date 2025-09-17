import { test } from "../../fixture";
import { INPUT_SELECTOR } from "../../helper/constant/generic";
import { checkForColouredSpans } from "../../helper/util/element_util.ts";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

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
      expected: "\nDesktop\texternal\tfoo\tnewlines.txt\tsome_rubbish.tmp",
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
      expected:
        "\narchive.zip\taudio.mp3\tdir\texecutable.sh\timage.png\tnormal.txt\trubbish.tmp",
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
      expected: `\n${existingFile}`,
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
      expected: "\n/src/main/nathanwise/.bashrc",
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
      expected: `\nls: cannot access '${fakePath}': No such file or directory`,
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
      type: "Should output information for each argument when an Unknown Path and Directory are provided",
      args: [existingDirectory, fakePath],
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        "\n/colour:" +
        "\narchive.zip\taudio.mp3\tdir\texecutable.sh\timage.png\tnormal.txt\trubbish.tmp",
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
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}\t/src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\narchive.zip\taudio.mp3\tdir\texecutable.sh\timage.png\tnormal.txt\trubbish.tmp",
      counts: {
        directory: 1,
        executables: 1,
        archives: 1,
        graphics: 1,
        audios: 1,
        rubbish: 1,
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
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, `${input}${expected}`);
      await checkForColouredSpans(page, counts);
    });
  });

  ["-a", "--all"].forEach((flag) => {
    test.describe(`all flag: ${flag}`, () => {
      test(`Should output all files including dotfiles when the '${flag}' flag is provided with a directory arg`, async ({
        page,
      }) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const expected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n${existingFile}\t/src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\n.\t..\tarchive.zip\taudio.mp3\tdir\texecutable.sh\timage.png\tnormal.txt\trubbish.tmp";
        await assertOutputInTerminal(page, `${input}${expected}`);
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
      }) => {
        // Arrange
        const input = `ls ${flag} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const expected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}\t12 /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52" +
          "\n8 archive.zip\t8 audio.mp3\t4 dir\t8 executable.sh\t8 image.png\t8 normal.txt\t8 rubbish.tmp";
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

      test(`Should output the contents of a directory with increased total blocks when the '${flag}' & 'a'`, async ({
        page,
      }) => {
        // Arrange
        const input = `ls ${flag} -a ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const expected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8 ${existingFile}\t12 /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 56" +
          "\n4 .\t0 ..\t8 archive.zip\t8 audio.mp3\t4 dir\t8 executable.sh\t8 image.png\t8 normal.txt\t8 rubbish.tmp";
        await assertOutputInTerminal(page, `${input}${expected}`);
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
      }) => {
        // Arrange
        const input = `ls -sh ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

        // Act
        await page.locator(INPUT_SELECTOR).pressSequentially(input);
        await page.locator(INPUT_SELECTOR).press("Enter");

        // Assert
        const expected =
          `\nls: cannot access '${fakePath}': No such file or directory` +
          `\n8K ${existingFile}\t12K /src/main/nathanwise/.bashrc` +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52K" +
          "\n8K archive.zip\t8K audio.mp3\t4K dir\t8K executable.sh\t8K image.png\t8K normal.txt\t8K rubbish.tmp";
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
          `\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 ${existingFile}` +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t1K Sep 17 22:41 /src/main/nathanwise/.bashrc" +
          `\n\n${existingDirectory}:` +
          "\ntotal: 52K" +
          "\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 archive.zip" +
          "\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 audio.mp3" +
          "\ndrwxr-xr-x 2 root root\t4K Sep 17 22:41 dir" +
          "\n-rwxrwxrwx 1 root root\t1K Sep 17 22:41 executable.sh" +
          "\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 image.png" +
          "\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 normal.txt" +
          "\n-rw-rw-r-- 1 root root\t1K Sep 17 22:41 rubbish.tmp";
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
    }) => {
      // Arrange
      const input = `ls --block-size=2048 ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
      const expected =
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n${existingFile}\t/src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\narchive.zip\taudio.mp3\tdir\texecutable.sh\timage.png\tnormal.txt\trubbish.tmp";
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

  [
    {
      flags: ["-s"],
      blockSize: 1,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}\t12288 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip\t8192 audio.mp3\t4096 dir\t8192 executable.sh\t8192 image.png\t8192 normal.txt\t8192 rubbish.tmp",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 1,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n8192 ${existingFile}\t12288 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n8192 archive.zip\t8192 audio.mp3\t4096 dir\t8192 executable.sh\t8192 image.png\t8192 normal.txt\t8192 rubbish.tmp",
    },
    {
      flags: ["-s"],
      blockSize: 512,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n16 ${existingFile}\t24 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n16 archive.zip\t16 audio.mp3\t8 dir\t16 executable.sh\t16 image.png\t16 normal.txt\t16 rubbish.tmp",
    },
    {
      flags: ["-s", "-h"],
      blockSize: 2048,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n4 ${existingFile}\t6 /src/main/nathanwise/.bashrc` +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n4 archive.zip\t4 audio.mp3\t2 dir\t4 executable.sh\t4 image.png\t4 normal.txt\t4 rubbish.tmp",
    },
    {
      flags: ["-l"],
      blockSize: 1,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 1,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 53248" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp",
    },
    {
      flags: ["-l"],
      blockSize: 512,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 104" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t8 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp",
    },
    {
      flags: ["-l", "-h"],
      blockSize: 2048,
      expected:
        `\nls: cannot access '${fakePath}': No such file or directory` +
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t1 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 26" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t2 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp",
    },
  ].forEach(({ flags, blockSize, expected }) => {
    test(`Should alter the Block Size of Files when ${flags} is present with block size ${blockSize}`, async ({
      page,
    }) => {
      // Arrange
      const input = `ls ${flags.join(" ")} --block-size=${blockSize} ${existingDotFile} ${existingFile} ${existingDirectory} ${fakePath}`;

      // Act
      await runCommand(page, input);

      // Assert
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
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 52" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp";
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
        `\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 ${existingFile}` +
        "\n-rw-rw-r-- 1 nathanwise nathanwise\t144 Sep 17 22:41 /src/main/nathanwise/.bashrc" +
        `\n\n${existingDirectory}:` +
        "\ntotal: 52" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 archive.zip" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 audio.mp3" +
        "\ndrwxr-xr-x 2 root root\t4096 Sep 17 22:41 dir" +
        "\n-rwxrwxrwx 1 root root\t0 Sep 17 22:41 executable.sh" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 image.png" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 normal.txt" +
        "\n-rw-rw-r-- 1 root root\t0 Sep 17 22:41 rubbish.tmp";
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
