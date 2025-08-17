import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";

const pwd: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    const currentWorkingDirectory = FileSystemUtil.getCurrentWorkingDirectory();

    TerminalUtil.appendOutput(
      `\n${FileSystemUtil.formatPath(currentWorkingDirectory)}`,
    );
  },
};

// noinspection JSUnusedGlobalSymbols
export default pwd;
