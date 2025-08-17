// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { ParsedOptions } from "getopts";
import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";

// TODO: Clean up code! Make it readable

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

// TODO: JSDoc
function getPreviousWorkingDirectory(): string | null {
  if (workingDirectories.length !== 2) {
    return null;
  }

  return workingDirectories[0];
}

// TODO: JSDoc
function addWorkingDirectory(directory: string) {
  workingDirectories.push(directory);

  if (workingDirectories.length > 2) {
    workingDirectories.shift();
  }
}

// TODO: JSDoc
function changeDirectory(path: string) {
  const resolvedPathParts = FileSystemUtil.resolvePathParts(path);

  // TODO: walkFileTree causes issues for files that exist...
  if (resolvedPathParts === null) {
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: No such file or directory`);
    return;
  }

  const doesFileExist = FileSystemUtil.doesFileExist(resolvedPathParts);
  const doesDirectoryExist =
    FileSystemUtil.doesDirectoryExist(resolvedPathParts);

  if (doesFileExist) {
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: Not a directory`);
    return;
  } else if (!doesDirectoryExist) {
    TerminalUtil.appendOutput(`\nbash: cd: ${path}: No such file or directory`);
    return;
  }

  const formattedPath = FileSystemUtil.formatPath(resolvedPathParts);

  FileSystemUtil.setCurrentWorkingDirectory(formattedPath);

  const pathSeparator = "\\";
  const prompt = `C:${pathSeparator}${resolvedPathParts.join(pathSeparator)}>`;
  TerminalUtil.setPrompt(prompt);

  addWorkingDirectory(formattedPath);
}

const cd: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions: ParsedOptions = getopts(args);

    if (parsedOptions._.length === 0) {
      const homeDirectory = FileSystemUtil.formatPath(
        FileSystemUtil.getHomeDirectory(),
      );
      changeDirectory(homeDirectory);
      return;
    } else if (parsedOptions._.length > 1) {
      TerminalUtil.appendOutput("\nbash: cd: too many arguments");
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
