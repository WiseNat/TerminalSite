import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";

const clear: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    TerminalUtil.setText("");
  },
};

// noinspection JSUnusedGlobalSymbols
export default clear;
