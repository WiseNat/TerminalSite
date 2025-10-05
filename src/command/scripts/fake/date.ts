import { CommandScript } from "../../command_script.ts";
import TerminalUtil from "../../../util/terminal_util.ts";
import CommandUtil from "../../../util/command_util.ts";

const DATE: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    const errorMessage = CommandUtil.getCorruptedCommandMessage("date");
    TerminalUtil.appendOutput(errorMessage);
  },
};

// noinspection JSUnusedGlobalSymbols
export default DATE;
