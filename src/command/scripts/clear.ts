import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";

const CLEAR: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    TerminalUtil.setOutput("");
  },
};

// noinspection JSUnusedGlobalSymbols
export default CLEAR;
