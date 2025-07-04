import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";

const clear: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run(_args: string[]): void {
    TerminalUtil.setText("");
  },
};

// noinspection JSUnusedGlobalSymbols
export default clear;
