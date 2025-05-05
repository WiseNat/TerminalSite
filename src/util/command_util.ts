import CommandDetails from "../dto/command.ts";
import { CommandScript } from "../command/command_script.ts";
import getCommandScripts from "./meta_import_util.ts";

class CommandUtil {
  /**
   * Tokenises a command string and transforms it into a {@link CommandDetails}.
   *
   * @param command string containing space separated tokens, e.g. "git commit -m 'foo'"
   * @returns a new {@link CommandDetails} containing the command tokens.
   */
  public static tokenise(command: string): CommandDetails {
    const tokens: string[] = this.split(command);
    const name = tokens.length == 0 ? "" : tokens[0];
    const args: string[] =
      tokens.length > 1 ? tokens.slice(1, tokens.length) : [];

    return new CommandDetails(name, args);
  }

  /**
   * Splits the given command String into a list of strings using whitespace as a delimiter. This takes into account
   * quotations and will ensure values encased in quotations retain whitespace.
   * <p>
   * E.g. passing "git commit -m 'foo bar'" will return ["git", "commit", "-m", "foo bar"]
   *
   * @param command string to split
   * @return split command strings
   * @private
   */
  private static split(command: string): string[] {
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
   * Gets the command script with a name that resolves to the {@link CommandDetails} name.
   *
   * @param commandDetails details of the command.
   * @returns the {@link CommandScript} if it is found, null otherwise.
   */
  public static getCommandScript(
    commandDetails: CommandDetails,
  ): CommandScript | null {
    const path = `/src/command/scripts/${commandDetails.name}.ts`;

    const commandScript = getCommandScripts()[path];

    if (commandScript == undefined) {
      // TODO: Change this to be visible to users, rather than the dev console
      console.error(`Command "${commandDetails.name}" not found.`);
      return null;
    }

    return commandScript.default;
  }
}

export default CommandUtil;
