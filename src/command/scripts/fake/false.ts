import { CommandScript } from "../../command_script.ts";

const FALSE: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    // does nothing
  },
};

// noinspection JSUnusedGlobalSymbols
export default FALSE;
