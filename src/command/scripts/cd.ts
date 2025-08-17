// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { ParsedOptions } from "getopts";
import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";

let workingDirectories: string[] = [];

/**
 * Resets the working directories variable. Intended to only be used by Unit Tests
 * to reset state.
 *
 * @internal
 */
export function _resetWorkingDirectories() {
  workingDirectories = [];
}

/**
 * @returns the Previous Working Directory or null if it does not exist.
 */
function getPreviousWorkingDirectory(): string | null {
  if (workingDirectories.length !== 2) {
    return null;
  }

  return workingDirectories[0];
}

/**
 * Adds a working directory to a cache.
 * <p>
 * This is used to determine the Previous Working Directory, see {@link getPreviousWorkingDirectory}.
 *
 * @param directory the working directory to add.
 */
function addWorkingDirectory(directory: string) {
  workingDirectories.push(directory);

  if (workingDirectories.length > 2) {
    workingDirectories.shift();
  }
}

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
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: No such file or directory`);
    return;
  }

  if (FileSystemUtil.doesFileExist(resolvedPathParts)) {
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: Not a directory`);
    return;
  } else if (!FileSystemUtil.doesDirectoryExist(resolvedPathParts)) {
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: No such file or directory`);
    return;
  }

  const formattedPath = FileSystemUtil.formatPath(resolvedPathParts);

  FileSystemUtil.setCurrentWorkingDirectory(formattedPath);
  addWorkingDirectory(formattedPath);
}

const cd: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions: ParsedOptions = getopts(args);

    if (parsedOptions._.length > 1) {
      TerminalUtil.appendOutput("\nbash: cd: too many arguments");
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
        TerminalUtil.appendOutput("\nbash: cd: OLDPWD not set");
        return;
      }

      changeDirectory(previousWorkingDirectory);

      TerminalUtil.appendOutput(`\n${previousWorkingDirectory}`);
    } else {
      changeDirectory(path);
    }
  },
};

// noinspection JSUnusedGlobalSymbols
export default cd;
