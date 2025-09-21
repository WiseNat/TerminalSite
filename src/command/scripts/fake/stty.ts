import { CommandScript } from "../../command_script.ts";
import CommandUtil from "../../../util/command_util.ts";
import TerminalUtil from "../../../util/terminal_util.ts";

const STTY: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    const errorMessage = CommandUtil.getNoPermissionsCommandMessage("stty");
    TerminalUtil.appendOutput(`\n${errorMessage}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default STTY;
