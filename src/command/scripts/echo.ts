import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";

const ECHO: CommandScript = {
  async run(args: string[]): Promise<void> {
    const output = args.join(" ");
    TerminalUtil.appendOutput(output);
  },
};

// noinspection JSUnusedGlobalSymbols
export default ECHO;
