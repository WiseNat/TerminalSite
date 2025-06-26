import TokenisedCommand from "../dto/tokenised_command.ts";
import { CommandScript } from "../command/command_script.ts";
import getCommandScripts from "./meta_import_util.ts";
import log from "./log_util.ts";

export default class CommandUtil {
  /**
   * TODO
   *
   * @param command TODO
   */
  public static executeCommand(command: string) {
    const tokenisedCommand: TokenisedCommand = this.tokenise(command);
    const commandScript = this.getCommandScript(tokenisedCommand);

    if (commandScript !== null) {
      console.info(`Running command ${tokenisedCommand.name}`); // TODO: remove
      commandScript.run(tokenisedCommand.args);
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
  private static split(command: string): string[] {
    // TODO: investigate missing newlines in args! make a unit test for this!
    const quotes = `"'`;
    const whitespace = " \t\n\r";

    const values: string[] = [];
    let buffer = "";

    let insideQuotes = false;
    let currentQuoteChar = "";

    for (const char of command) {
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
      log.error(`Command "${tokenisedCommand.name}" not found.`);
      return null;
    }

    return commandScript.default;
  }
}
