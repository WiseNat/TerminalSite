import { CommandScript, Suggestion } from "../command_script.ts";
import CommandUtil from "../../util/command_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import TokenisedCommand from "../../dto/tokenised_command.ts";
import FormatterUtil from "../../util/formatter_util.ts";
import CommandImportUtil from "../../util/command_import_util.ts";
import AutocompleteUtil from "../../util/autocomplete_util.ts";

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
      output = getAllCommandSynopses();
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

  async autocomplete(
    _userInput: string,
    args: string[],
  ): Promise<Suggestion[] | null> {
    const searchValue = args.length === 0 ? "" : args.at(-1)!;
    return AutocompleteUtil.getCommandSuggestions(searchValue);
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

/**
 * Gets two columns containing all commands with their synopses.
 */
function getAllCommandSynopses(): string {
  let synopses: string[] = [];
  const commandScripts = CommandImportUtil.getCommandScripts();

  for (const commandScript of Object.values(commandScripts)) {
    const helpInformation = commandScript.default.help();

    if (helpInformation === null) {
      continue;
    }

    synopses.push(helpInformation.synopsis);
  }

  synopses = synopses.sort((a, b) => a.localeCompare(b));
  const rowAmount = Math.ceil(synopses.length / 2);
  const columns: string[] = [
    synopses.slice(0, rowAmount).join("\n"),
    synopses.slice(rowAmount, synopses.length).join("\n"),
  ];

  return FormatterUtil.toResponsiveColumns(columns);
}

/**
 * Gets the Help information for a given command.
 * <p>
 * This will get the first valid command from the list of provided `commands`.
 *
 * @param commands a list of potentially invalid command names.
 * @param flags the flags to pass to {@link getHelpForCommand}.
 */
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

/**
 * @param commands list of command names
 * @returns the first valid command found, null if none are valid
 */
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

/**
 * Gets the Help output for a single command.
 * <p>
 * Uses the `helpInformation` and formats it based on the `flags`.
 *
 * @param command the command name.
 * @param helpInformation object containing relevant help information.
 * @param flags
 */
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
    const options = getOptionSection(helpInformation.options);
    output += `\n\n${indentContent("Options:", 4)}\n${indentContent(options, 6)}`;
  }

  if (helpInformation.additionalInformation) {
    output += `\n\n${indentContent(helpInformation.additionalInformation, 4)}`;
  }

  if (helpInformation.arguments) {
    const argumentsString = getArgumentSection(helpInformation.arguments);
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

/**
 * Creates an Option section using the provided `options`.
 *
 * @param options help information options
 * @returns a formatted option section
 */
function getOptionSection(options: HelpInformation["options"]) {
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

  return FormatterUtil.toStaticColumns(columns);
}

/**
 * Creates an Argument section using the provided `helpArguments`.
 *
 * @param helpArguments help information argument
 * @returns a formatted argument section
 */
function getArgumentSection(
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

  return FormatterUtil.toStaticColumns(columns);
}

// noinspection JSUnusedGlobalSymbols
export default HELP;
