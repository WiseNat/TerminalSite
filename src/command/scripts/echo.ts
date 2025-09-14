import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import getopts, { ParsedOptions } from "getopts";

// TODO: Change echo so that this command works (try in terminal then site): echo -a sadoas das''a as '"'
const ECHO: CommandScript = {
  async run(args: string[]): Promise<void> {
    // Don't rely on CommandUtil.parseArgs as we want to silently ignore any error flags
    const parsedOptions: ParsedOptions = getopts(args);

    const output = parsedOptions._.join(" ");
    TerminalUtil.appendOutput(`\n${output}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default ECHO;
