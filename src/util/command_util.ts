// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { Options, ParsedOptions } from "getopts";
import Expander, { ExecutionCommand } from "../shell/expander.ts";
import { CommandScript } from "../command/command_script.ts";
import TerminalUtil from "./terminal_util.ts";
import CommandImportUtil from "./command_import_util.ts";
import FileSystemUtil from "./file_system_util.ts";
import { escape } from "lodash-es";
import Parser, { SimpleCommand } from "../shell/parser.ts";
import Lexer, { LexerError } from "../shell/lexer.ts";

export default class CommandUtil {
  /**
   * Executes a command using the given command string.
   * Will output to the terminal if no command is found.
   * <p>
   * Follows the shell command language guidelines where relevant -
   * https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19
   * 1. Read in input (received in this method as `command`)
   * 2. [Lexer] Break input into tokens (words & operators)
   * 3. [Parser] Parse tokenised input into simple/compound commands
   * 4. [Expander] For each word, process backslash escaped sequences & word expansion
   * 5. [CommandUtil] Perform redirection (piping and redirect in/out, redundant for now)
   * 6. [CommandUtil] Execute a command, providing the relevant arguments
   * 7. [CommandUtil] Optionally (always) wait for the command to complete and collect the exit status (redundant)
   *
   * @param command a command string, e.g. 'echo foo bar'
   */
  public static async executeCommand(command: string) {
    const prompt = TerminalUtil.getRawPrompt();
    TerminalUtil.appendRawOutput(prompt + escape(command), true);
    TerminalUtil.setInput("");

    let executionCommand: ExecutionCommand;

    try {
      const lexer: Lexer = new Lexer(command);
      const simpleCommand: SimpleCommand = Parser.parse(lexer);
      executionCommand = Expander.expand(simpleCommand);
    } catch (error) {
      if (error instanceof LexerError) {
        TerminalUtil.appendOutput("syntax error: " + error.message);
      } else {
        console.warn("Unexpected error occurred: " + error);
      }

      return;
    }

    if (executionCommand.name !== "") {
      const commandScript = this.getCommandScript(executionCommand.name);

      if (commandScript === null) {
        TerminalUtil.appendOutput(
          `${executionCommand.name}: command not found`,
        );
      } else {
        // Fixes visual issues with non-instant commands
        TerminalUtil.setPrompt("");

        console.info(
          `Running command '${executionCommand.name}' with args '${executionCommand.args}'`,
        );
        await commandScript.run(executionCommand.args);

        if (TerminalUtil.getPrompt() === "") {
          TerminalUtil.setRawPrompt(prompt);
        }
      }
    }
  }

  /**
   * Gets the command script with a name that resolves to the `commandName`.
   *
   * @param commandName name of the command, e.g. `terminal`
   * @returns the {@link CommandScript} if it is found, null otherwise.
   */
  public static getCommandScript(commandName: string): CommandScript | null {
    const commandScript = CommandImportUtil.getCommandScripts()[commandName];

    if (commandScript === undefined) {
      console.warn(`Command "${commandName}" not found.`);
      return null;
    }

    return commandScript.default;
  }

  /**
   * Parses args into {@link ParsedOptions}.
   * <p>
   * Any args that aren't specified in `options` will cause an error message to
   * be outputted in the terminal for the first unknown argument.
   *
   * @example
   * const commandName = "myCommand"
   * const args = ["example", "-foo", "--bar"];
   * const options = {
   *   boolean: ["a", "b"],
   *   alias: {
   *     bar: ["b"],
   *   }
   * }
   *
   * const parsedOptions = CommandUtil.parseArgs(commandName, args, options);
   * // myCommand: invalid option -- 'f'
   *
   * if (parsedOptions === null) {
   *   return;
   * }
   *
   * @param commandName the name of the command that the args are being parsed for.
   * @param args list of string args to pass, can include flags.
   * @param options series of options for {@link getopts}.
   * @returns {@link ParsedOptions} if the args were passed successfully, null otherwise
   */
  public static parseArgs(
    commandName: string,
    args: string[],
    options: Options,
  ): ParsedOptions | null {
    let unknownFlag: string | null = null;
    options.unknown = (option: string) => {
      unknownFlag ??= option;
      return false;
    };

    const parsedOptions: ParsedOptions = getopts(args, options);

    if (unknownFlag !== null) {
      TerminalUtil.appendOutput(
        `${commandName}: invalid option -- '${unknownFlag}'`,
      );
      return null;
    }

    return parsedOptions;
  }

  /**
   * @param commandName the name of the command
   * @returns an error message for a corrupted command
   */
  public static getCorruptedCommandMessage(commandName: string): string {
    return `/bin/${commandName}: cannot execute binary file: Exec format error`;
  }

  /**
   * @param commandName the name of the command
   * @returns an error message for a command that the user has no permissions to execute
   */
  public static getNoPermissionsCommandMessage(commandName: string): string {
    return `/bin/${commandName}: Permission denied`;
  }

  /**
   * Gets an error message based on the provided file path.
   *
   * @param path the file (not directory) path to get an error message for, absolute or relative.
   * @param commandName the name of the calling command to be included in the error message.
   * @returns the error message for the provided path.
   */
  public static getInvalidFilePathError(
    path: string,
    commandName: string,
  ): string {
    const segmentedPath = FileSystemUtil.resolvePathParts(path);

    if (segmentedPath === null) {
      return `${commandName}: ${path}: No such file or directory`;
    }

    const resolvedFilePath = FileSystemUtil.formatPath(segmentedPath);
    const node = FileSystemUtil.walkFileTree(segmentedPath);

    if (!node?.isDirectory) {
      return `${commandName}: ${resolvedFilePath}: No such file or directory`;
    }

    return `${commandName}: ${resolvedFilePath}: Is a directory`;
  }
}
