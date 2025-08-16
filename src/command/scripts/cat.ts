// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { ParsedOptions } from "getopts";
import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FileImportUtil from "../../util/file_import_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";

// TODO: Render []() as an 'a' tag with a href + unit test + e2e test

const cat: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions: ParsedOptions = getopts(args);

    if (parsedOptions._.length === 0) {
      return;
    }

    const output: string[] = [];

    for (const filePath of parsedOptions._) {
      const fileContents = await FileImportUtil.readFile(filePath);

      if (fileContents === null) {
        const resolvedFilePath = FileSystemUtil.resolvePath(filePath);

        output.push(
          `cat: ${resolvedFilePath ?? filePath}: No such file or directory`,
        );
      } else {
        output.push(fileContents + (fileContents.endsWith("\n") ? " " : ""));
      }
    }

    TerminalUtil.appendOutput(`\n${output.join("\n")}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default cat;
