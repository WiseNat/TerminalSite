import { CommandScript } from "../../command_script.ts";
import { HelpInformation } from "../help.ts";

const TRUE: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    // does nothing
  },

  help(): HelpInformation | null {
    return {
      synopsis: "true",
      shortDescription: "Return a successful result.",
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default TRUE;
