import { beforeEach, describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../src/util/command_util";
import { CommandScript } from "../../../../src/command/command_script";
import TokenisedCommand from "../../../../src/dto/tokenised_command";
import TerminalUtil from "../../../../src/util/terminal_util";
import { unmock } from "../../helper/unmock";
import CommandImportUtil from "../../../../src/util/command_import_util.ts";
import { Options } from "getopts";

describe("CommandUtil", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../src/util/terminal_util");
  vi.mock("../../../../src/util/command_import_util");

  beforeEach(async () => {
    await unmock("../../../src/util/command_import_util", [
      "default",
      "getKey",
    ]);
  });

  describe("executeCommand", () => {
    test("runs a command when it is found", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        test: { default: mockCommandFile },
      });

      const command = "test foo bar";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(mockCommandFile.run).toHaveBeenCalled();
      expect(appendOutput).toHaveBeenCalledOnce();
    });

    test("outputs that a command is not found when it does not exist", async () => {
      // Arrange
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});

      const command = "test foo bar";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendOutput).toHaveBeenCalledTimes(2);
      expect(appendOutput).toHaveBeenCalledWith("test: command not found");
    });

    test("outputs nothing when a command is not found with no name", async () => {
      // Arrange
      const prompt = "C:\\home\\nathanwise>";
      vi.mocked(TerminalUtil.getPrompt).mockReturnValue(prompt);
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});

      const command = "";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendOutput).toHaveBeenCalledOnce();
      expect(appendOutput).toHaveBeenCalledWith(`${prompt}`, true);
    });
  });

  describe("tokenise", () => {
    [
      {
        type: "a command with multiple arguments",
        commandString: "mycommand foo -m bar",
        expectedCommand: "mycommand",
        expectedArgs: ["foo", "-m", "bar"],
      },
      {
        type: "a command with no arguments",
        commandString: "mycommand",
        expectedCommand: "mycommand",
        expectedArgs: [],
      },
      {
        type: "an empty command",
        commandString: "",
        expectedCommand: "",
        expectedArgs: [],
      },
      {
        type: "a complex command",
        commandString: "git commit -m \"foo 'bar'\" and 'baz \"gaz'",
        expectedCommand: "git",
        expectedArgs: ["commit", "-m", "foo 'bar'", "and", "baz \"gaz"],
      },
      {
        type: "a command with arguments with double quoted spaces",
        commandString: "mycommand \"foo bar\"",
        expectedCommand: "mycommand",
        expectedArgs: ["foo bar"],
      },
      {
        type: "a command with arguments with single quoted spaces",
        commandString: "mycommand 'foo bar'",
        expectedCommand: "mycommand",
        expectedArgs: ["foo bar"],
      },
      {
        type: "a command with excessive whitespace",
        commandString: "mycommand  ab \r  'foo \tbar' \n ",
        expectedCommand: "mycommand",
        expectedArgs: ["ab", "foo \tbar"],
      },
      {
        type: "a command with newlines and ignores them",
        commandString: "mycommand foo\nbar baz \ngaz",
        expectedCommand: "mycommand",
        expectedArgs: ["foobar", "baz", "gaz"],
      },
    ].forEach(({ type, commandString, expectedCommand, expectedArgs }) => {
      test(`correctly tokenises ${type}`, () => {
        // Arrange & Act
        const command = CommandUtil.tokenise(commandString);

        // Assert
        expect(command.name).toBe(expectedCommand);
        expect(command.args).toStrictEqual(expectedArgs);
      });
    });
  });

  describe("getCommandScripts", () => {
    beforeEach(async () => {
      await unmock("../../../src/util/command_import_util", [
        "default",
        "getKey",
      ]);
    });

    test("should not return the command scripts if given the filename of the command", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        test: { default: mockCommandFile },
      });
      const commandDetails: TokenisedCommand = new TokenisedCommand(
        "./test.ts",
        [],
      );

      // Act
      const result = CommandUtil.getCommandScript(commandDetails);

      // Assert
      expect(result).toBeNull();
    });

    test("should return the command scripts if it exists", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        test: { default: mockCommandFile },
      });
      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      // Act
      const result = CommandUtil.getCommandScript(commandDetails);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBe(mockCommandFile);
    });

    test("should return undefined if command does not exist", async () => {
      // Arrange
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});
      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      // Act
      const result = CommandUtil.getCommandScript(commandDetails);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("parseArgs", () => {
    [
      {
        type: "should return the parsed options when given valid args and valid options",
        args: ["example", "-f", "data", "--bar", "bar data"],
        options: {
          boolean: ["f"],
          string: ["b"],
          alias: {
            bar: ["b"],
          },
        },
        expected: {
          _: ["example", "data"],
          b: "bar data",
          bar: "bar data",
          f: true,
        },
      },
      {
        type: "should return empty parsed options when given no args and valid options",
        args: [],
        options: {
          boolean: ["f"],
          string: ["b"],
          alias: {
            bar: ["b"],
          },
        },
        expected: {
          _: [],
          b: "",
          bar: "",
          f: false,
        },
      },
      {
        type: "should return empty parsed options when given no args and no options",
        args: [],
        options: {},
        expected: {
          _: [],
        },
      },
    ].forEach(({ type, args, options, expected }) => {
      test(type, async () => {
        // Act
        const result = CommandUtil.parseArgs("myCommand", args, options);

        // Assert
        expect(appendOutput).not.toHaveBeenCalled();

        expect(result).not.toBeNull();
        expect(result).toEqual(expected);
      });
    });

    [
      {
        type: "single unknown flag",
        args: ["example", "-f", "data", "-z", "--bar", "bar data"],
        unknownFlag: "z",
      },
      {
        type: "multiple unknown flags",
        args: ["example", "-f", "data", "--baz", "-z", "--bar", "bar data"],
        unknownFlag: "baz",
      },
    ].forEach(({ type, args, unknownFlag }) => {
      test(`should output an error when given args with a ${type}`, async () => {
        // Arrange
        const options: Options = {
          boolean: ["f"],
          string: ["b"],
          alias: {
            bar: ["b"],
          },
        };

        // Act
        const result = CommandUtil.parseArgs("myCommand", args, options);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `myCommand: invalid option -- '${unknownFlag}'`,
        );

        expect(result).toBeNull();
      });
    });
  });
});
