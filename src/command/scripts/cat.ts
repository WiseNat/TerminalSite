import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FileImportUtil from "../../util/file_import_util.ts";
import { escape } from "lodash-es";
import CommandUtil from "../../util/command_util.ts";
import { HelpInformation } from "./help.ts";

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
        const errorMessage = CommandUtil.getInvalidFilePathError(
          filePath,
          "cat",
        );
        output.push(errorMessage);
      } else {
        let result = fileContents + (fileContents.endsWith("\n") ? " " : "");

        result = insertAnchorElements(result);

        output.push(result);
      }
    }

    TerminalUtil.appendRawOutput(output.join("\n"));
  },

  help(): HelpInformation | null {
    return {
      synopsis: "cat: cat [FILE ...]",
      shortDescription: "Concatenate files and print on the standard output.",
      longDescription: "Concatenate FILE(s) to standard output.",
      arguments: [
        {
          name: "FILE",
          description: "paths to files to concatenate",
        },
      ],
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default CAT;

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
  return text.replaceAll(
    /\[([^\]]+)]\(([^)]+)\)|([^[]+)/g,
    (_match, text, url, outside) => {
      // Text outside of []()
      if (outside === undefined) {
        return `<a href='${url}' target='_blank'>${text}</a>`;
      } else {
        return escape(outside);
      }
    },
  );
}
