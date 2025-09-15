import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FileImportUtil from "../../util/file_import_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import { escape } from "lodash-es";
import CommandUtil from "../../util/command_util.ts";

const CAT: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("cat", args, {});

    if (parsedOptions === null || parsedOptions._.length === 0) {
      return;
    }

    const output: string[] = [];

    for (const filePath of parsedOptions._) {
      const fileContents = await FileImportUtil.readFile(filePath);

      if (fileContents === null) {
        const errorMessage = await getInvalidPathError(filePath);
        output.push(errorMessage);
      } else {
        let result = fileContents + (fileContents.endsWith("\n") ? " " : "");

        result = insertAnchorElements(result);

        output.push(result);
      }
    }

    TerminalUtil.appendRawOutput(`\n${output.join("\n")}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default CAT;

/**
 * Gets an error message based on the provided path.
 *
 * @param path the path to get an error message for, absolute or relative.
 * @returns the error message for the provided path.
 */
async function getInvalidPathError(path: string): Promise<string> {
  const segmentedPath = FileSystemUtil.resolvePathParts(path);

  if (segmentedPath === null) {
    return `cat: ${path}: No such file or directory`;
  }

  const resolvedFilePath = FileSystemUtil.formatPath(segmentedPath);
  const node = FileSystemUtil.walkFileTree(segmentedPath);

  // node === null || !node.isDirectory
  if (!node?.isDirectory) {
    return `cat: ${resolvedFilePath}: No such file or directory`;
  }

  return `cat: ${resolvedFilePath}: Is a directory`;
}

/**
 * Replaces Markdown URLs with an Anchor Element.
 * <p>
 * Escapes any other text.
 *
 * @param text the text to modify
 *
 * @returns text with Anchor elements and escaped text
 */
function insertAnchorElements(text: string): string {
  return text.replace(
    /\[([^\]]+)]\(([^)]+)\)|([^[]+)/g,
    (_match, text, url, outside) => {
      // Text outside of []()
      if (outside !== undefined) {
        return escape(outside);
      } else {
        return `<a href='${url}' target='_blank'>${text}</a>`;
      }
    },
  );
}
