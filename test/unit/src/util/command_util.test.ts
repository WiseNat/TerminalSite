import { beforeEach, describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../src/util/command_util";
import { CommandScript } from "../../../../src/command/command_script";
import TokenisedCommand from "../../../../src/dto/tokenised_command";
import TerminalUtil from "../../../../src/util/terminal_util";
import { unmock } from "../../helper/unmock";
import CommandImportUtil from "../../../../src/util/command_import_util.ts";
import { Options } from "getopts";
import FileSystemUtil from "../../../../src/util/file_system_util.ts";

describe("CommandUtil", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");

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
      const mockCommandFile: CommandScript = { run: vi.fn(), help: vi.fn() };
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        test: { default: mockCommandFile },
      });

      const command = "test foo bar";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(mockCommandFile.run).toHaveBeenCalled();
      expect(appendRawOutput).toHaveBeenCalledOnce();
    });

    test("outputs that a command is not found when it does not exist", async () => {
      // Arrange
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});

      const command = "test foo bar";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendRawOutput).toHaveBeenCalledOnce();
      expect(appendOutput).toHaveBeenCalledOnce();
      expect(appendOutput).toHaveBeenCalledWith("test: command not found");
    });

    test("outputs nothing when a command is not found with no name", async () => {
      // Arrange
      const prompt = "C:\\home\\nathanwise>";
      vi.mocked(TerminalUtil.getRawPrompt).mockReturnValue(prompt);
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});

      const command = "";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendRawOutput).toHaveBeenCalledOnce();
      expect(appendRawOutput).toHaveBeenCalledWith(`${prompt}`, true);
    });

    test("outputs escaped content when HTML content is provided", async () => {
      // Arrange
      const prompt = "C:\\home\\nathanwise>";
      vi.mocked(TerminalUtil.getRawPrompt).mockReturnValue(prompt);
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});

      const command = "echo foo<a href='https://nathanwise.software'>bar</a>";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      const escapedCommand =
        "echo foo&lt;a href=&#39;https://nathanwise.software&#39;&gt;bar&lt;/a&gt;";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
        prompt + escapedCommand,
        true,
      );
    });
  });

  describe("substituteVariables", () => {
    [
      {
        variable: "$HOME",
        expected: "/home/nathanwise",
      },
      {
        variable: "a$HOME",
        expected: "a/home/nathanwise",
      },
      {
        variable: "a$HOMEb",
        expected: "a",
      },
      {
        variable: "a$HOME b",
        expected: "a/home/nathanwise b",
      },
      {
        variable: "${HOME}",
        expected: "/home/nathanwise",
      },
      {
        variable: "a${HOME}",
        expected: "a/home/nathanwise",
      },
      {
        variable: "a${HOME}b",
        expected: "a/home/nathanwiseb",
      },
      {
        variable: "a${HOMEb",
        expected: "a${HOMEb",
      },
      {
        variable: "\"a${HOME}b\"",
        expected: "a/home/nathanwiseb",
      },
      {
        variable: "'a${HOME}b'",
        expected: "a${HOME}b",
      },
      {
        variable: "a\"${HOME}\"b",
        expected: "a/home/nathanwiseb",
      },
      {
        variable: "a'${HOME}'b",
        expected: "a${HOME}b",
      },
      {
        variable: "a'\"${HOME}\"'b",
        expected: "a\"${HOME}\"b",
      },
      {
        variable: "a\"'${HOME}'\"b",
        expected: "a'/home/nathanwise'b",
      },
      {
        variable: "a\"'\"${HOME}\"'\"b",
        expected: "a'/home/nathanwise'b",
      },
      {
        variable: "a'\"'${HOME}'\"'b",
        expected: "a\"/home/nathanwise\"b",
      },
      {
        variable: "a\\${HOME}b",
        expected: "a${HOME}b",
      },
      {
        variable: "\\\"a${HOME}b\"",
        expected: "\"a/home/nathanwiseb",
      },
      {
        variable: "\\'a${HOME}b'",
        expected: "'a/home/nathanwiseb",
      },
      {
        variable: "a'\"\\${HOME}\"'b",
        expected: "a\"\\${HOME}\"b",
      },
      {
        variable: "'\\${HOME}'",
        expected: "\\${HOME}",
      },
      {
        variable: "a${HOME\\}}b",
        expected: "a}b",
      },
    ].forEach(({ variable, expected }) => {
      test(`${variable} -> ${expected}`, async () => {
        // Arrange
        FileSystemUtil.setHomeDirectory("/home/nathanwise");
        const input = `${variable}`;

        // Act
        const output = CommandUtil.substituteVariables(input);

        // Assert
        expect(output).toBe(expected);
      });
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
      const mockCommandFile: CommandScript = { run: vi.fn(), help: vi.fn() };
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
      const mockCommandFile: CommandScript = { run: vi.fn(), help: vi.fn() };
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

  describe("getInvalidFilePathError", () => {
    test("should return an error if the given path is a directory path", () => {
      // Arrange
      const path = "/src/main";
      const commandName = "COMMAND_NAME";

      // Act
      const result = CommandUtil.getInvalidFilePathError(path, commandName);

      // Assert
      expect(result).toEqual("COMMAND_NAME: /src/main: Is a directory");
    });

    test("should return an error if the given path is unknown", () => {
      // Arrange
      const path = "/some/fake/path";
      const commandName = "COMMAND_NAME";

      // Act
      const result = CommandUtil.getInvalidFilePathError(path, commandName);

      // Assert
      expect(result).toEqual(
        "COMMAND_NAME: /some/fake/path: No such file or directory",
      );
    });
  });
});
