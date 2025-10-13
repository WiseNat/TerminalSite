import { expect, test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";
import { isMobileProject } from "../../helper/util/playwright_util.ts";
import {
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic.ts";

test.describe("Help", () => {
  test("Should show two columns of command synopses for all available commands, when no args or flags are provided", async ({
    page,
  }, testInfo) => {
    // Arrange
    const input = "help";

    // Act
    await runCommand(page, input);

    // Assert
    const desktopExpected =
      "\n cat [FILE ...]                                                    ls [FILE] [-l|-1] [-ahs] [--block-size block-size]" +
      "\n cd [DIR]                                                          neofetch [-L|--logo] [--off]" +
      "\n clear                                                             pwd" +
      "\n download [FILE]                                                   reboot" +
      "\n echo [ARG ...]                                                    tree [-a] [-d] [-f] [-L level] [--prune] [DIRECTORY ...]" +
      "\n false                                                             true" +
      "\n help [COMMAND]                                                    uname [-a|--all] [-i|--hardware-platform] [-m|--machine] [-n|-->" +
      "\n hostname: hostname [-d|--domain] [-f|--fqdn|--long] [-i|--ip-ad>";

    const mobileExpected =
      "\n cat [FILE ...]      ls [FILE] [-l|-1]>" +
      "\n cd [DIR]            neofetch [-L|--lo>" +
      "\n clear               pwd" +
      "\n download [FILE]     reboot" +
      "\n echo [ARG ...]      tree [-a] [-d] [->" +
      "\n false               true" +
      "\n help [COMMAND]      uname [-a|--all] >" +
      "\n hostname: hostnam>";

    if (isMobileProject(testInfo)) {
      await assertOutputInTerminal(page, `${input}${mobileExpected}`);
    } else {
      await assertOutputInTerminal(page, `${input}${desktopExpected}`);
    }
  });

  [
    {
      type: "Should show the full help information for a command, when a command is provided",
      args: ["ls"],
    },
    {
      type: "Should show the full help information for the first command and ignore any other commands, when multiple commands are provided",
      args: ["ls", "echo", "cd"],
    },
    {
      type: "Should show the full help information for the first valid command and ignore any other commands, when multiple commands are provided",
      args: ["someFakeCommand", "ls", "echo", "cd"],
    },
  ].forEach(({ type, args }) => {
    test(type, async ({ page }, testInfo) => {
      // Arrange
      let input = "help";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

      // Act
      await runCommand(page, input);

      // Assert
      const desktopExpected =
        "\nls: ls [FILE] [-l|-1] [-ahs] [--block-size block-size]\n" +
        "    List directory contents.\n" +
        "\n" +
        "    List information about the FILEs (the current directory by default). Sort entries alphabetically. Mandatory arguments to long op\n" +
        "    tions are mandatory for short options too.\n" +
        "\n" +
        "    Options:\n" +
        "      -a, --all              do not ignore entries starting with .\n" +
        "          --block-size=SIZE  with -l, scale sizes by SIZE when printing them; e.g. '--block-size=1024'; see SIZE format below\n" +
        "      -h, --human-readable   with -l and -s, print sizes like 1K 234M 2G etc.\n" +
        "      -l                     use a long listing format\n" +
        "      -s, --size             print the allocated size of each file, in blocks\n" +
        "      -1                     list one file per line\n" +
        "\n" +
        "    The SIZE argument is an integer (example: 1024 for 1 kilobyte).\n" +
        "\n" +
        "    Arguments:\n" +
        "      FILE  path to either a file or directory";

      const mobileExpected =
        "\nls: ls [FILE] [-l|-1] [-ahs] [--block-size block-size]\n" +
        "    List directory contents.\n" +
        "\n" +
        "    List information about the FILEs (th\n" +
        "    e current directory by default). Sor\n" +
        "    t entries alphabetically. Mandatory \n" +
        "    arguments to long options are mandat\n" +
        "    ory for short options too.\n" +
        "\n" +
        "    Options:\n" +
        "      -a, --all              do not igno\n" +
        "      re entries starting with .\n" +
        "          --block-size=SIZE  with -l, sc\n" +
        "      ale sizes by SIZE when printing th\n" +
        "      em; e.g. '--block-size=1024'; see \n" +
        "      SIZE format below\n" +
        "      -h, --human-readable   with -l and\n" +
        "       -s, print sizes like 1K 234M 2G e\n" +
        "      tc.\n" +
        "      -l                     use a long \n" +
        "      listing format\n" +
        "      -s, --size             print the a\n" +
        "      llocated size of each file, in blo\n" +
        "      cks\n" +
        "      -1                     list one fi\n" +
        "      le per line\n" +
        "\n" +
        "    The SIZE argument is an integer (exa\n" +
        "    mple: 1024 for 1 kilobyte).\n" +
        "\n" +
        "    Arguments:\n" +
        "      FILE  path to either a file or dir\n" +
        "      ectory";

      if (isMobileProject(testInfo)) {
        await assertOutputInTerminal(page, `${input}${mobileExpected}`);
      } else {
        await assertOutputInTerminal(page, `${input}${desktopExpected}`);
      }
    });
  });

  [
    {
      type: "an unknown command is provided",
      args: ["someFakeCommand"],
      expected:
        "\nbash: help: no help topics match 'someFakeCommand'. Try 'help' to view a list of available help topics.",
    },
    {
      type: "multiple unknown commands are provided",
      args: ["foo", "bar", "baz"],
      expected:
        "\nbash: help: no help topics match 'baz'. Try 'help' to view a list of available help topics.",
    },
  ].forEach(({ type, args, expected }) => {
    test(`Should show an error when ${type}`, async ({ page }) => {
      // Arrange
      let input = "help";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, input + expected);
    });
  });

  ["-d"].forEach((flag) => {
    test.describe(`short description flag: ${flag}`, () => {
      test(`Should show a short short description for a command, when ${flag} and a command is provided`, async ({
        page,
      }) => {
        // Arrange
        const input = `help ls ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected = "\nls - List directory contents.";
        await assertOutputInTerminal(page, input + expected);
      });
    });
  });

  ["-s"].forEach((flag) => {
    test.describe(`synopsis flag: ${flag}`, () => {
      test(`Should show a short usage synopsis for a command, when ${flag} and a command is provided`, async ({
        page,
      }) => {
        // Arrange
        const input = `help ls ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected =
          "\nls: ls [FILE] [-l|-1] [-ahs] [--block-size block-size]";
        await assertOutputInTerminal(page, input + expected);
      });
    });
  });

  test.describe("Autocomplete", () => {
    test("Should autocomplete 'ech' arg to 'echo ', when tab is pressed with 'help ech'", async ({
      page,
    }) => {
      // Arrange
      const input = "help ech";

      // Act
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Tab");

      // Assert
      await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
        DEFAULT_INITIAL_PROMPT,
      );
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
        "help echo ",
      );
    });

    test("Should provide suggestions for every command, when tab is pressed with 'help '", async ({
      page,
    }) => {
      // Arrange
      const input = "help ";
      // Providing a list of various commands so this test does not have to be updated when a new command is added
      const commands = ["help", "cat", "cd", "kill", "mkdir", "tree", "pwd"];

      // Act
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Tab");

      // Assert
      for (const command of commands) {
        await expect(page.locator(OUTPUT_SELECTOR)).toContainText(command);
      }

      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(input);
    });
  });
});
