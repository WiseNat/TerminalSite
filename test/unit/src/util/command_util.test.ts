import { beforeEach, describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../src/util/command_util";
import { CommandScript } from "../../../../src/command/command_script";
import TokenisedCommand from "../../../../src/dto/tokenised_command";
import TerminalUtil from "../../../../src/util/terminal_util";
import { unmock } from "../../helper/unmock";
import MetaImportUtil from "../../../../src/util/meta_import_util";
import { userPrompt } from "../../../../src/constant/prompt";

describe("CommandUtil", () => {
  describe("executeCommand", () => {
    // Spy
    const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

    // Mock
    vi.mock("../../../../src/util/terminal_util");
    vi.mock("../../../../src/util/meta_import_util");

    // Other
    beforeEach(async () => {
      await unmock("../../../src/util/meta_import_util", ["default", "getKey"]);
    });

    test("runs a command when it is found", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
        "./test.ts": { default: mockCommandFile },
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
      vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({});

      const command = "test foo bar";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith("\ntest: command not found");
      expect(appendOutput).toHaveBeenCalledTimes(2);
    });

    test("outputs nothing when a command is not found with no name", async () => {
      // Arrange
      vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({});

      const command = "";

      // Act
      await CommandUtil.executeCommand(command);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith(`\n${userPrompt}`);
      expect(appendOutput).toHaveBeenCalledOnce();
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
    // Mock
    vi.mock("../../../../src/util/meta_import_util");

    // Other
    beforeEach(async () => {
      await unmock("../../../src/util/meta_import_util", ["default", "getKey"]);
    });

    test("should return the command scripts if it exists", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
        "./test.ts": { default: mockCommandFile },
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
      vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({});
      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      // Act
      const result = CommandUtil.getCommandScript(commandDetails);

      // Assert
      expect(result).toBeNull();
    });
  });
});
