import CommandDetails from "../dto/command.ts";
import { CommandScript } from "../command/command_script.ts";
import getCommandScripts from "./meta_import_util.ts";

class CommandUtil {
  // TODO: JSDoc
  public static tokenise(command: string): CommandDetails {
    const tokens: string[] = command.split(" ");
    const name: string = tokens[0];
    const args: string[] =
      tokens.length > 1 ? tokens.slice(1, tokens.length) : [];

    return new CommandDetails(name, args);
  }

  // TODO: JSDoc
  public static async getCommandScript(
    commandDetails: CommandDetails,
  ): Promise<CommandScript | undefined> {
    const path = `./commands/${commandDetails.name}.ts`;

    console.info(getCommandScripts());
    const importer: () => Promise<CommandScript> = getCommandScripts()[path];

    if (!importer) {
      console.error(`Command "${commandDetails.name}" not found.`);
      return;
    }

    return await importer();
  }
}

export default CommandUtil;
