import { CommandScript } from "../../command_script.ts";
import { HelpInformation } from "../help.ts";

const FALSE: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    // does nothing
  },

  help(): HelpInformation | null {
    return null;
  },
};

// noinspection JSUnusedGlobalSymbols
export default FALSE;
