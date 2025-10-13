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
        `bash: help: no help topics match '${parsedOptions._.at(-1)}'. Try 'help' to view a list of available help topics.`;
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

  const responsiveColumns = FormatterUtil.toResponsiveColumns(columns);
  return FormatterUtil.indentContent(responsiveColumns, 1);
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
    `\n${FormatterUtil.indentContent(helpInformation.shortDescription, 4)}`;

  if (helpInformation.longDescription) {
    output += `\n\n${FormatterUtil.indentContent(helpInformation.longDescription, 4)}`;
  }

  if (helpInformation.options) {
    const options = getOptionSection(helpInformation.options);
    output +=
      `\n\n${FormatterUtil.indentContent("Options:", 4)}` +
      `\n${FormatterUtil.indentContent(options, 6)}`;
  }

  if (helpInformation.additionalInformation) {
    output += `\n\n${FormatterUtil.indentContent(helpInformation.additionalInformation, 4)}`;
  }

  if (helpInformation.arguments) {
    const argumentsString = getArgumentSection(helpInformation.arguments);
    output +=
      `\n\n${FormatterUtil.indentContent("Arguments:", 4)}` +
      `\n${FormatterUtil.indentContent(argumentsString, 6)}`;
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
