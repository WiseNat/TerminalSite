import { CommandScript } from "../command_script.ts";
import CommandUtil from "../../util/command_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import TokenisedCommand from "../../dto/tokenised_command.ts";
import FormatterUtil from "../../util/formatter_util.ts";

export interface HelpInformation {
  synopsis: string;
  shortDescription: string;
  longDescription?: string;
  options?: {
    short?: string;
    long?: string;
    description: string;
  }[];
  additionalInformation?: string;
  arguments?: {
    name: string;
    description: string;
  }[];
}

const HELP: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("help", args, {
      boolean: ["d", "s"],
    });

    if (parsedOptions === null) {
      return;
    }

    let output: string;
    if (parsedOptions._.length === 0) {
      // TODO: list all commands
      output = "TODO!!";
    } else {
      output =
        getHelpForCommands(parsedOptions._, {
          d: parsedOptions.d,
          s: parsedOptions.s,
        }) ??
        `bash: help: no help topics match '${parsedOptions._.at(-1)}'.  Try 'help help'.`;
    }

    TerminalUtil.appendOutput(output);
  },

  help(): HelpInformation | null {
    return {
      synopsis: "help [COMMAND]",
      shortDescription: "Display information about builtin commands.",
      longDescription:
        "Displays brief summaries of builtin commands.  If COMMAND is specified, gives detailed help on the COMMAND, " +
        "e the list of help topics is printed.",
      options: [
        {
          short: "d",
          description: "output short description",
        },
        {
          short: "s",
          description: "output only a short usage synopsis",
        },
      ],
      arguments: [
        {
          name: "COMMAND",
          description: "name of the command",
        },
      ],
    };
  },
};

interface Flags {
  d: boolean;
  s: boolean;
}

// TODO: JSDoc
function getHelpForCommands(commands: string[], flags: Flags): string | null {
  const command = getFirstValidCommand(commands);

  if (command === null) {
    return null;
  }

  const helpInformation = command.script.help();

  if (helpInformation === null) {
    return null;
  }

  return getHelpForCommand(command.name, helpInformation, flags);
}

// TODO: JSDoc
function getFirstValidCommand(
  commands: string[],
): { name: string; script: CommandScript } | null {
  for (const command of commands) {
    const tokenisedCommand: TokenisedCommand = CommandUtil.tokenise(command);
    const commandScript = CommandUtil.getCommandScript(tokenisedCommand);

    if (commandScript !== null) {
      return { name: command, script: commandScript };
    }
  }

  return null;
}

// TODO: JSDoc
function getHelpForCommand(
  command: string,
  helpInformation: HelpInformation,
  flags: Flags,
): string {
  if (flags.s) {
    return getSynopsis(command, helpInformation);
  }

  if (flags.d) {
    return `${command} - ${helpInformation.shortDescription}`;
  }

  let output: string =
    `${getSynopsis(command, helpInformation)}` +
    `\n${indentContent(helpInformation.shortDescription, 4)}`;

  if (helpInformation.longDescription) {
    output += `\n\n${indentContent(helpInformation.longDescription, 4)}`;
  }

  if (helpInformation.options) {
    const options = getOptionString(helpInformation.options);
    output += `\n\n${indentContent("Options:", 4)}\n${indentContent(options, 6)}`;
  }

  if (helpInformation.additionalInformation) {
    output += `\n\n${indentContent(helpInformation.additionalInformation, 4)}`;
  }

  if (helpInformation.arguments) {
    const argumentsString = getArgumentString(helpInformation.arguments);
    output += `\n\n${indentContent("Arguments:", 4)}\n${indentContent(argumentsString, 6)}`;
  }

  return output.trimEnd();
}

function getSynopsis(
  command: string,
  helpInformation: HelpInformation,
): string {
  return `${command}: ${helpInformation.synopsis}`;
}

/**
 * Indents content and splits content across multiple lines.
 * @param content the content to indent.
 * @param indentSize the size of the indent.
 */
function indentContent(content: string, indentSize: number): string {
  const contentLines = content.split("\n");
  const resolvedLines: string[] = [];

  const charactersPerLine = FormatterUtil.getCharactersPerLine(
    TerminalUtil.getOutputElement(),
  );

  for (const line of contentLines) {
    if (line.length + indentSize >= charactersPerLine) {
      const chunks = toChunks(line, charactersPerLine - indentSize);
      resolvedLines.push(...chunks);
    } else {
      resolvedLines.push(line);
    }
  }

  const indent = " ".repeat(indentSize);
  const lines = resolvedLines.map((line) => `${indent}${line}`);
  return lines.join("\n");
}

/**
 * Converts the `str` into chunks with a maximum size of `size`.
 *
 * @param str the string to convert.
 * @param size the size of the chunks.
 */
function toChunks(str: string, size: number): string[] {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  let start = 0;
  for (let i = 0; i < numChunks; ++i) {
    chunks[i] = str.substring(start, start + size);
    start += size;
  }

  return chunks;
}

// TODO: JSDoc
function getOptionString(options: HelpInformation["options"]) {
  if (options === undefined) {
    return "";
  }

  const columns: [string, string] = ["", ""];
  for (const option of options) {
    let argumentColumn = "";

    if (option.short) {
      argumentColumn += `-${option.short}`;
    }

    if (option.long) {
      if (option.short) {
        argumentColumn += `, --${option.long}`;
      } else {
        argumentColumn += `    --${option.long}`;
      }
    }

    columns[0] += `\n${argumentColumn}`;
    columns[1] += `\n${option.description}`;

    const descriptionLineCount = option.description.split("\n").length;
    if (descriptionLineCount > 1) {
      columns[0] += "\n".repeat(descriptionLineCount - 1);
    }
  }

  columns[0] = columns[0].trimStart();
  columns[1] = columns[1].trimStart();

  return FormatterUtil.toStaticColumns(columns, 2);
}

// TODO: JSDoc
function getArgumentString(
  helpArguments: HelpInformation["arguments"],
): string {
  if (helpArguments === undefined) {
    return "";
  }

  const columns: [string, string] = ["", ""];
  for (const argument of helpArguments) {
    columns[0] += `\n${argument.name}`;
    columns[1] += `\n${argument.description}`;

    const descriptionLineCount = argument.description.split("\n").length;
    if (descriptionLineCount > 1) {
      columns[0] += "\n".repeat(descriptionLineCount - 1);
    }
  }

  columns[0] = columns[0].trimStart();
  columns[1] = columns[1].trimStart();

  return FormatterUtil.toStaticColumns(columns, 2);
}

// noinspection JSUnusedGlobalSymbols
export default HELP;
