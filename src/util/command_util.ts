// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { Options, ParsedOptions } from "getopts";
import TokenisedCommand from "../dto/tokenised_command.ts";
import { CommandScript } from "../command/command_script.ts";
import TerminalUtil from "./terminal_util.ts";
import CommandImportUtil from "./command_import_util.ts";
import FileSystemUtil from "./file_system_util.ts";

export default class CommandUtil {
  /**
   * Executes a command using the given command string.
   * Will output to the terminal if no command is found.
   *
   * @param command a command string, e.g. 'echo foo bar'
   */
  public static async executeCommand(command: string) {
    const tokenisedCommand: TokenisedCommand = this.tokenise(command);
    const prompt = TerminalUtil.getRawPrompt();

    if (tokenisedCommand.name === "") {
      TerminalUtil.appendRawOutput(prompt, true);
    } else {
      TerminalUtil.appendRawOutput(prompt + command, true);
      TerminalUtil.setInput("");

      const commandScript = this.getCommandScript(tokenisedCommand);

      if (commandScript === null) {
        TerminalUtil.appendOutput(
          `${tokenisedCommand.name}: command not found`,
        );
      } else {
        // Fixes visual issues with non-instant commands
        TerminalUtil.setPrompt("");

        console.info(
          `Running command '${tokenisedCommand.name}' with args '${tokenisedCommand.args}'`,
        );
        await commandScript.run(tokenisedCommand.args);

        if (TerminalUtil.getPrompt() === "") {
          TerminalUtil.setRawPrompt(prompt);
        }
      }
    }
  }

  /**
   * Tokenises a command string and transforms it into a {@link TokenisedCommand}.
   *
   * @param command string containing space separated tokens, e.g. "git commit -m 'foo'"
   * @returns a new {@link TokenisedCommand} containing the command tokens.
   */
  public static tokenise(command: string): TokenisedCommand {
    const tokens: string[] = this.split(command);
    const name = tokens.length === 0 ? "" : tokens[0];
    const args: string[] =
      tokens.length > 1 ? tokens.slice(1, tokens.length) : [];

    return new TokenisedCommand(name, args);
  }

  /**
   * Splits the given command String into a list of strings using whitespace as a delimiter. This takes into account
   * quotations and will ensure values encased in quotations retain whitespace.
   * <p>
   * E.g. passing "git commit -m 'foo bar'" will return ["git", "commit", "-m", "foo bar"]
   *
   * @param command string to split
   * @returns split command strings
   * @private
   */
  // prettier-ignore
  private static split(command: string): string[] {  // NOSONAR: reducing cognitive complexity for this is difficult
    const quotes = "\"'";
    const whitespace = " \t\r";

    const values: string[] = [];
    let buffer = "";

    let insideQuotes = false;
    let currentQuoteChar = "";

    for (const char of command) {
      // Ignore newlines, treat them as line continuations
      if (char === "\n") {
        continue;
      }

      // Check if inside of quotes to allow an argument with spaces, e.g. echo 'foo bar' baz
      if (quotes.includes(char)) {
        if (!insideQuotes) {
          insideQuotes = true;
          currentQuoteChar = char;
          continue;
        } else if (char === currentQuoteChar) {
          insideQuotes = false;
          continue;
        }
      }

      if (!insideQuotes && whitespace.includes(char)) {
        if (buffer.length > 0) {
          values.push(buffer);
          buffer = "";
        }

        continue;
      }

      buffer += char;
    }

    if (buffer.length > 0) {
      values.push(buffer);
    }

    return values;
  }

  /**
   * Gets the command script with a name that resolves to the {@link TokenisedCommand} name.
   *
   * @param tokenisedCommand details of the command.
   * @returns the {@link CommandScript} if it is found, null otherwise.
   */
  public static getCommandScript(
    tokenisedCommand: TokenisedCommand,
  ): CommandScript | null {
    const commandScript =
      CommandImportUtil.getCommandScripts()[tokenisedCommand.name];

    if (commandScript === undefined) {
      console.warn(`Command "${tokenisedCommand.name}" not found.`);
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
