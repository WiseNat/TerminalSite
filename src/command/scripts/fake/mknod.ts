import { CommandScript } from "../../command_script.ts";
import CommandUtil from "../../../util/command_util.ts";
import TerminalUtil from "../../../util/terminal_util.ts";

const MKNOD: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    const errorMessage = CommandUtil.getNoPermissionsCommandMessage("mknod");
    TerminalUtil.appendOutput(`\n${errorMessage}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default MKNOD;
