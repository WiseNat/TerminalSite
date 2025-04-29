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
    const tokens: string[] = command.split(" ");
    const name: string = tokens[0];
    const args: string[] =
      tokens.length > 1 ? tokens.slice(1, tokens.length) : [];

    return new CommandDetails(name, args);
  }

  /**
   * Gets the command script with a name that resolves to the {@link CommandDetails} name.
   *
   * @param commandDetails details of the command.
   * @returns the {@link CommandScript} if it is found, {@link undefined} otherwise.
   */
  public static async getCommandScript(
    commandDetails: CommandDetails,
  ): Promise<CommandScript | undefined> {
    const path = `/src/command/scripts/${commandDetails.name}.ts`;

    const importer: () => Promise<{ default: CommandScript }> =
      getCommandScripts()[path];

    if (!importer) {
      console.error(`Command "${commandDetails.name}" not found.`);
      return;
    }

    const module = await importer();
    return module.default;
  }
}

export default CommandUtil;
