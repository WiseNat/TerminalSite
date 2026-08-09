import { beforeEach, describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../src/util/command_util";
import { CommandScript } from "../../../../src/command/command_script";
import TerminalUtil from "../../../../src/util/terminal_util";
import { unmock } from "../../helper/unmock";
import CommandImportUtil from "../../../../src/util/command_import_util.ts";
import { Options } from "getopts";

// Mocks
vi.mock("../../../../src/util/terminal_util");
vi.mock("../../../../src/util/command_import_util");

describe("CommandUtil", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");

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
      const commandName: string = "./test.ts";

      // Act
      const result = CommandUtil.getCommandScript(commandName);

      // Assert
      expect(result).toBeNull();
    });

    test("should return the command scripts if it exists", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn(), help: vi.fn() };
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        test: { default: mockCommandFile },
      });
      const commandName: string = "test";

      // Act
      const result = CommandUtil.getCommandScript(commandName);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBe(mockCommandFile);
    });

    test("should return undefined if command does not exist", async () => {
      // Arrange
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({});
      const commandName: string = "test";

      // Act
      const result = CommandUtil.getCommandScript(commandName);

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
