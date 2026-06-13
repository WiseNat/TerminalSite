import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { HelpInformation } from "./help.ts";

const CLEAR: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    TerminalUtil.clearTerminal();
  },

  help(): HelpInformation | null {
    return {
      synopsis: "clear",
      shortDescription: "Clear the terminal screen.",
      longDescription:
        "clear clears your terminal's screen and its scrollback buffer, if any.",
      additionalInformation:
        "The clear command has a lengthy history, dating back to 1979. Read the real clear man-page for more information.",
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default CLEAR;
