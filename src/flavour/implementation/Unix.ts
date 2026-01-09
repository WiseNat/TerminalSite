import { Flavour, TextContent } from "../flavour.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import {
  ENTRY_FOUR_BRIGHT_FOREGROUND_CLASS,
  ENTRY_TWO_BRIGHT_FOREGROUND_CLASS,
} from "../../constant/theme.ts";
import { HOSTNAME } from "../../constant/system.ts";

const UNIX: Flavour = {
  getInitialPrompt(): TextContent {
    return { value: "", isHTML: false };
  },

  getPrompt(path: string[]): TextContent {
    const homeDirectory = FileSystemUtil.getHomeDirectory();
    const pathStartsWithHomeDirectory = startsWith(path, homeDirectory);

    let formattedPath: string;
    if (pathStartsWithHomeDirectory) {
      path = replacePrefix(
        path,
        homeDirectory,
        FileSystemUtil.homeDirectorySymbol,
      );
      formattedPath = path.join(FileSystemUtil.pathSeparator);
    } else {
      formattedPath = FileSystemUtil.formatPath(path);
    }

    return {
      value:
        `<span class="${ENTRY_TWO_BRIGHT_FOREGROUND_CLASS}" style="font-weight: bold">${FileSystemUtil.username}@${HOSTNAME}</span>` +
        ":" +
        `<span class="${ENTRY_FOUR_BRIGHT_FOREGROUND_CLASS}" style="font-weight: bold">${formattedPath}</span>` +
        "$ ",
      isHTML: true,
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default UNIX;

/**
 * Checks if the `path` starts with the elements in the `prefix`.
 */
function startsWith(path: string[], prefix: string[]) {
  if (prefix.length > path.length) {
    return false;
  }

  return prefix.every((value, index) => value === path[index]);
}

/**
 * Replaces the `prefix` in the `array` with a single element `replacement`.
 * Assumes the `prefix` exists in the `array`.
 *
 * @param array the array containing the prefix.
 * @param prefix prefix to replace with the `replacement`.
 * @param replacement value to replace the `prefix` with.
 */
function replacePrefix<T>(
  array: readonly T[],
  prefix: readonly T[],
  replacement: T,
): T[] {
  if (prefix.length > array.length) return [...array];

  for (let i = 0; i < prefix.length; i++) {
    if (array[i] !== prefix[i]) {
      return [...array];
    }
  }

  return [replacement, ...array.slice(prefix.length)];
}
