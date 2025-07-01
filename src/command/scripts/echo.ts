import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";

// noinspection JSUnusedGlobalSymbols
export default {
  run(args: string[]) {
    const output = args.join(" ");
    TerminalUtil.appendText(`\n${output}`);
  },
} as CommandScript;
