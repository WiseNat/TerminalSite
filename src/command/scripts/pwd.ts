import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { HelpInformation } from "./help.ts";

const PWD: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    const currentWorkingDirectory = FileSystemUtil.getCurrentWorkingDirectory();

    TerminalUtil.appendOutput(
      FileSystemUtil.formatPath(currentWorkingDirectory),
    );
  },

  help(): HelpInformation | null {
    return {
      synopsis: "pwd",
      shortDescription: "Print the name of the current working directory.",
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default PWD;
