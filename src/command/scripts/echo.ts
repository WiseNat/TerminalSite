import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { HelpInformation } from "./help.ts";

const ECHO: CommandScript = {
  async run(args: string[]): Promise<void> {
    const output = args.join(" ");
    TerminalUtil.appendOutput(output);
  },

  help(): HelpInformation | null {
    return {
      synopsis: "echo [ARG ...]",
      shortDescription: "Write arguments to the standard output.",
      longDescription:
        "Display the ARGs, separated by a single space character and followed by a\n" +
        "newline, on the standard output.",
      additionalInformation:
        // prettier-ignore
        "'echo' interprets everything as a fixed string and will not transform backslash-escaped characters such as '\\n'", // NOSONAR,
      arguments: [
        {
          name: "ARG",
          description: "arguments to output",
        },
      ],
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default ECHO;
