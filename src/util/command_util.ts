import TokenisedCommand from "../dto/tokenised_command.ts";
import { CommandScript } from "../command/command_script.ts";
import getCommandScripts from "./meta_import_util.ts";
import TerminalUtil from "./terminal_util.ts";

export default class CommandUtil {
  /**
   * Executes a command using the given command string.
   * Will output to the terminal if no command is found.
   *
   * @param command a command string, e.g. 'echo foo bar'
   */
  public static executeCommand(command: string) {
    const tokenisedCommand: TokenisedCommand = this.tokenise(command);
    const commandScript = this.getCommandScript(tokenisedCommand);

    if (commandScript !== null) {
      commandScript.run(tokenisedCommand.args);
    } else {
      TerminalUtil.appendText(`\n${tokenisedCommand.name}: command not found`);
    }

    // TODO: move prompt var somewhere else
    const prompt = "C:\\Users\\user>";
    TerminalUtil.appendText(`\n${prompt}`);

    TerminalUtil.updateReadOnlyIndex();
  }

  /**
   * Tokenises a command string and transforms it into a {@link TokenisedCommand}.
   *
   * @param command string containing space separated tokens, e.g. "git commit -m 'foo'"
   * @returns a new {@link TokenisedCommand} containing the command tokens.
   */
  public static tokenise(command: string): TokenisedCommand {
    const tokens: string[] = this.split(command);
    const name = tokens.length == 0 ? "" : tokens[0];
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
    const quotes = `"'`;
    const whitespace = " \t\r";

    const values: string[] = [];
    let buffer = "";

    let insideQuotes = false;
    let currentQuoteChar = "";

    for (const char of command) {
      // Ignore newlines, treat them as line continuations
      if (char == "\n") {
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
    const path = `/src/command/scripts/${tokenisedCommand.name}.ts`;

    const commandScript = getCommandScripts()[path];

    if (commandScript == undefined) {
      console.warn(`\nCommand "${tokenisedCommand.name}" not found.`);
      return null;
    }

    return commandScript.default;
  }
}
