import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FileImportUtil from "../../util/file_import_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import { escape } from "lodash-es";
import CommandUtil from "../../util/command_util.ts";

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

const cat: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("cat", args, {});

    if (parsedOptions === null || parsedOptions._.length === 0) {
      return;
    }

    const output: string[] = [];

    for (const filePath of parsedOptions._) {
      const fileContents = await FileImportUtil.readFile(filePath);

      if (fileContents === null) {
        const resolvedFilePath = FileSystemUtil.resolvePath(filePath);

        // TODO: WHAT IF IT IS A DIRECTORY, SHOULD OUTPUT 'cat: /home/nathan/Desktop/: Is a directory'
        output.push(
          `cat: ${resolvedFilePath ?? filePath}: No such file or directory`,
        );
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
export default cat;
