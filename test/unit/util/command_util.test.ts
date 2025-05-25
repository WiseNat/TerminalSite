import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../src/util/command_util";
import { CommandScript } from "../../../src/command/command_script";
import TokenisedCommand from "../../../src/dto/tokenised_command";
import getCommandScripts from "../../../src/util/meta_import_util";

describe("CommandUtil", () => {
  describe("tokenise", () => {
    test("correctly tokenises a command with multiple arguments", () => {
      const commandString = "mycommand foo -m bar";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo", "-m", "bar"]);
    });

    test("correctly tokenises a command with no arguments", () => {
      const commandString = "mycommand";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual([]);
    });

    test("correctly tokenises an empty command", () => {
      const commandString = "";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });

    test("correctly tokenises a complex command", () => {
      const commandString = "git commit -m \"foo 'bar'\" and 'baz \"gaz'";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("git");
      expect(command.args).toStrictEqual([
        "commit",
        "-m",
        "foo 'bar'",
        "and",
        'baz "gaz',
      ]);
    });

    test("correctly tokenises a command with arguments with double quoted spaces", () => {
      const commandString = 'mycommand "foo bar"';

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo bar"]);
    });

    test("correctly tokenises a command with arguments with single quoted spaces", () => {
      const commandString = "mycommand 'foo bar'";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["foo bar"]);
    });

    test("correctly tokenises a command with excessive whitespace", () => {
      const commandString = "mycommand  ab \r  'foo \tbar' \n ";

      const command = CommandUtil.tokenise(commandString);

      expect(command.name).toBe("mycommand");
      expect(command.args).toStrictEqual(["ab", "foo \tbar"]);
    });
  });

  describe("getCommandScripts", () => {
    vi.mock("../../../src/util/meta_import_util");

    test("should return the command scripts if it exists", async () => {
      const mockCommandFile: CommandScript = { run: vi.fn() };

      vi.mocked(getCommandScripts).mockReturnValue({
        "/src/command/scripts/test.ts": { default: mockCommandFile },
      });

      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      const result = await CommandUtil.getCommandScript(commandDetails);

      expect(result).not.toBeNull();
      expect(result).toBe(mockCommandFile);
    });

    test("should return undefined if command does not exist", async () => {
      vi.mocked(getCommandScripts).mockReturnValue({});

      const commandDetails: TokenisedCommand = new TokenisedCommand("test", []);

      const result = await CommandUtil.getCommandScript(commandDetails);

      expect(result).toBeNull();
    });
  });
});
