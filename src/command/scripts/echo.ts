import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import getopts, { ParsedOptions } from "getopts";

const echo: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions: ParsedOptions = getopts(args);

    const output = parsedOptions._.join(" ");
    TerminalUtil.appendText(`\n${output}\n`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default echo;
