import { test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Help", () => {
  test("Should show two columns of command synopses for all available commands, when no args or flags are provided", async ({
    page,
  }) => {
    // Arrange
    const input = "help";

    // Act
    await runCommand(page, input);

    // Assert
    const expected = "\nTODO";
    await assertOutputInTerminal(page, input + expected);
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
    test(type, async ({ page }) => {
      // Arrange
      let input = "help";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

      // Act
      await runCommand(page, input);

      // Assert
      const expected =
        "\nls: ls [FILE] [-l | -1] [-ahs] [--block-size block-size]\n" +
        "    List directory contents.\n" +
        "\n" +
        "    List information about the FILEs (the current directory by default).  Sort entries alphabetically\n" +
        "    Mandatory arguments to long options are mandatory for short options too.\n" +
        "\n" +
        "    Options:\n" +
        "      -a, --all              do not ignore entries starting with .\n" +
        "          --block-size=SIZE  with -l, scale sizes by SIZE when printing them;\n" +
        "                             e.g., '--block-size=M'; see SIZE format below\n" +
        "      -h, --human-readable   with -l and -s, print sizes like 1K 234M 2G etc.\n" +
        "      -l                     use a long listing format\n" +
        "      -s, --size             print the allocated size of each file, in blocks\n" +
        "      -1                     list one file per line\n" +
        "\n" +
        "    The SIZE argument is an integer (example: 1024 for 1 kilobyte).\n" +
        "\n" +
        "    Arguments:\n" +
        "      FILE  Path to either a File or Directory";

      await assertOutputInTerminal(page, input + expected);
    });
  });

  [
    {
      type: "an unknown command is provided",
      args: ["someFakeCommand"],
      expected:
        "\nbash: help: no help topics match `someFakeCommand'.  Try `help help'.",
    },
    {
      type: "multiple unknown commands are provided",
      args: ["foo", "bar", "baz"],
      expected: "\nbash: help: no help topics match `baz'.  Try `help help'.",
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
          "\nls: ls [FILE] [-l | -1] [-ahs] [--block-size block-size]";
        await assertOutputInTerminal(page, input + expected);
      });
    });
  });
});
