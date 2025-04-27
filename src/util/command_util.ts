import Command from "../dto/command.ts";

class CommandUtil {
  public static tokenise(command: string): Command {
    const tokens: string[] = command.split(" ");
    const name: string = tokens[0];
    const args: string[] =
      tokens.length > 1 ? tokens.slice(1, tokens.length) : [];

    return new Command(name, args);
  }
}

export default CommandUtil;
