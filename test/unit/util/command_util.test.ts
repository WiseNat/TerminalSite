import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../src/util/command_util";
import { CommandScript } from "../../../src/command/command_script";
import TokenisedCommand from "../../../src/dto/tokenised_command";
import getCommandScripts from "../../../src/util/meta_import_util";
import TerminalUtil from "../../../src/util/terminal_util";

describe("CommandUtil", () => {
  describe("executeCommand", () => {
    // Spy
    const appendText = vi.spyOn(TerminalUtil, "appendText");
    const updateReadOnlyIndex = vi.spyOn(TerminalUtil, "updateReadOnlyIndex");

    // Mock
    vi.mock("../../../src/util/terminal_util");

    test("runs a command when it is found", () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(getCommandScripts).mockReturnValue({
        "/src/command/scripts/test.ts": { default: mockCommandFile },
      });

      const command = "test foo bar";

      // Act
      CommandUtil.executeCommand(command);

      // Assert
      expect(mockCommandFile.run).toHaveBeenCalled();
      expect(appendText).toHaveBeenCalledOnce();
      expect(updateReadOnlyIndex).toHaveBeenCalledOnce();
    });

    test("outputs that a command is not found when it does not exist", () => {
      // Arrange
      vi.mocked(getCommandScripts).mockReturnValue({});

      const command = "test foo bar";

      // Act
      CommandUtil.executeCommand(command);

      // Assert
      expect(appendText).toHaveBeenCalledWith("\ntest: command not found\n");
      expect(appendText).toHaveBeenCalledTimes(2);
      expect(updateReadOnlyIndex).toHaveBeenCalledOnce();
    });

    test("outputs nothing when a command is not found with no name", () => {
      // Arrange
      vi.mocked(getCommandScripts).mockReturnValue({});
      const appendText = vi.spyOn(TerminalUtil, "appendText");

      const command = "";

      // Act
      CommandUtil.executeCommand(command);

      // Assert
      expect(appendText).toHaveBeenCalledWith("\n");
      expect(appendText).toHaveBeenCalledTimes(2);
      expect(updateReadOnlyIndex).toHaveBeenCalledOnce();
    });
  });

  describe("tokenise", () => {
    test("correctly tokenises a command with multiple arguments", () => {
      // Arrange
      const commandString = "mycommand foo -m bar";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo", "-m", "bar"]);
    });

    test("correctly tokenises a command with no arguments", () => {
      // Arrange
      const commandString = "mycommand";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual([]);
    });

    test("correctly tokenises an empty command", () => {
      // Arrange
      const commandString = "";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });

    test("correctly tokenises a complex command", () => {
      // Arrange
      const commandString = "git commit -m \"foo 'bar'\" and 'baz \"gaz'";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("git");
      expect(command.args).toStrictEqual([
        "commit",
        "-m",
        "foo 'bar'",
        "and",
        "baz \"gaz",
      ]);
    });

    test("correctly tokenises a command with arguments with double quoted spaces", () => {
      // Arrange
      const commandString = "mycommand \"foo bar\"";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo bar"]);
    });

    test("correctly tokenises a command with arguments with single quoted spaces", () => {
      // Arrange
      const commandString = "mycommand 'foo bar'";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo bar"]);
    });

    test("correctly tokenises a command with excessive whitespace", () => {
      // Arrange
      const commandString = "mycommand  ab \r  'foo \tbar' \n ";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["ab", "foo \tbar"]);
    });

    test("correctly tokenises a command with newlines and ignores them", () => {
      // Arrange
      const commandString = "mycommand foo\nbar baz \ngaz";

      // Act
      const command = CommandUtil.tokenise(commandString);

      // Assert
      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foobar", "baz", "gaz"]);
    });
  });

  describe("getCommandScripts", () => {
    vi.mock("../../../src/util/meta_import_util");

    test("should return the command scripts if it exists", async () => {
      // Arrange
      const mockCommandFile: CommandScript = { run: vi.fn() };
      vi.mocked(getCommandScripts).mockReturnValue({
        "/src/command/scripts/test.ts": { default: mockCommandFile },
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
      vi.mocked(getCommandScripts).mockReturnValue({});
      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      // Act
      const result = CommandUtil.getCommandScript(commandDetails);

      // Assert
      expect(result).toBeNull();
    });
  });
});
