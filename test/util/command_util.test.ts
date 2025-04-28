import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../src/util/command_util";
import { CommandScript } from "../../src/command/command_script";
import CommandDetails from "../../src/dto/command";
import getCommandScripts from "../../src/util/meta_import_util";

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
  });

  describe("getCommandScripts", () => {
    vi.mock("../../src/util/meta_import_util");

    test("should return the command scripts if it exists", async () => {
      const mockCommandFile: CommandScript = { run: vi.fn() };

      vi.mocked(getCommandScripts).mockReturnValue({
        "./commands/test.ts": vi.fn().mockResolvedValue(mockCommandFile),
      });

      const commandDetails: CommandDetails = new CommandDetails("test", []);

      const result = await CommandUtil.getCommandScript(commandDetails);

      expect(result).toBeDefined();
      expect(result).toBe(mockCommandFile);
    });

    test("should return undefined if command does not exist", async () => {
      vi.mocked(getCommandScripts).mockReturnValue({});

      const commandDetails: CommandDetails = new CommandDetails("test", []);

      const result = await CommandUtil.getCommandScript(commandDetails);

      expect(result).toBeUndefined();
    });
  });
});
