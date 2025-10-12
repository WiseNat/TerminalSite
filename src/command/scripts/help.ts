import { CommandScript } from "../command_script.ts";
import CommandUtil from "../../util/command_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import TokenisedCommand from "../../dto/tokenised_command.ts";
import FormatterUtil from "../../util/formatter_util.ts";

export interface HelpInformation {
  synopsis: string;
  shortDescription: string;
  longDescription: string;
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
        `bash: help: no help topics match \`${parsedOptions._.at(-1)}'.  Try \`help help'.`;
    }

    TerminalUtil.appendOutput(output);
  },

  help(): HelpInformation | null {
    return null;
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
    return helpInformation.synopsis;
  }

  if (flags.d) {
    return `${command} - ${helpInformation.shortDescription}`;
  }

  let output: string =
    `${helpInformation.synopsis}` +
    `\n${indentContent(helpInformation.shortDescription, 4)}` +
    "\n" +
    `\n${indentContent(helpInformation.longDescription, 4)}`;

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

  return output;
}

// TODO: JSDoc
function indentContent(content: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  const lines = content.split("\n").map((line) => `${indent}${line}`);
  return lines.join("\n");
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
