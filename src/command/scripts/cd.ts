import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";

let workingDirectories: string[] = [];

const CD: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("cd", args, {});

    if (parsedOptions === null) {
      return;
    }

    if (parsedOptions._.length > 1) {
      TerminalUtil.appendOutput("bash: cd: too many arguments");
      return;
    }

    if (parsedOptions._.length === 0) {
      const homeDirectory = FileSystemUtil.formatPath(
        FileSystemUtil.getHomeDirectory(),
      );

      changeDirectory(homeDirectory);
      return;
    }

    const path = parsedOptions._[0];

    if (path === "-") {
      const previousWorkingDirectory = getPreviousWorkingDirectory();

      if (previousWorkingDirectory === null) {
        TerminalUtil.appendOutput("bash: cd: OLDPWD not set");
        return;
      }

      changeDirectory(previousWorkingDirectory);

      TerminalUtil.appendOutput(previousWorkingDirectory);
    } else {
      changeDirectory(path);
    }
  },
};

// noinspection JSUnusedGlobalSymbols
export default CD;

/**
 * Changes the directory & prompt to the provided path if it is valid.
 * <p>
 * A series of error messages are created on the frontend if the path is not valid.
 *
 * @param path the path to change to.
 */
function changeDirectory(path: string) {
  const resolvedPathParts = FileSystemUtil.resolvePathParts(path);

  if (resolvedPathParts === null) {
    TerminalUtil.appendOutput(`bash: cd: ${path}: No such file or directory`);
    return;
  }

  if (FileSystemUtil.doesFileExist(resolvedPathParts)) {
    TerminalUtil.appendOutput(`bash: cd: ${path}: Not a directory`);
    return;
  } else if (!FileSystemUtil.doesDirectoryExist(resolvedPathParts)) {
    TerminalUtil.appendOutput(`bash: cd: ${path}: No such file or directory`);
    return;
  }

  const formattedPath = FileSystemUtil.formatPath(resolvedPathParts);

  updateCurrentWorkingDirectory();

  FileSystemUtil.setCurrentWorkingDirectory(formattedPath);
}

/**
 * Updates the cached current working directory with the current working directory.
 * <p>
 * This is used to determine the Previous Working Directory, see {@link getPreviousWorkingDirectory}.
 */
function updateCurrentWorkingDirectory() {
  const currentWorkingDirectory = FileSystemUtil.getCurrentWorkingDirectory();
  workingDirectories[0] = FileSystemUtil.formatPath(currentWorkingDirectory);
}

/**
 * @returns the Previous Working Directory or null if it does not exist.
 */
function getPreviousWorkingDirectory(): string | null {
  return workingDirectories.length === 0 ? null : workingDirectories[0];
}

/**
 * Resets the working directories variable.
 *
 * @internal **intended to be solely used by Tests**
 */
export function _resetWorkingDirectories() {
  workingDirectories = [];
}
