import { describe, expect, test } from "vitest";
import CommandUtil from "../../src/util/command_util";

describe("CommandUtil", () => {
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
