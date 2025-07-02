import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import getopts, { ParsedOptions } from "getopts";

// noinspection JSUnusedGlobalSymbols
export const echo: CommandScript = {
  run(args: string[]): void {
    const parsedOptions: ParsedOptions = getopts(args);

    const output = parsedOptions._.join(" ");
    TerminalUtil.appendText(`\n${output}`);
  },
};
