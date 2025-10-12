import { CommandScript } from "../command_script.ts";
import HtmlUtil from "../../util/html_util.ts";
import { HelpInformation } from "./help.ts";

const REBOOT: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    HtmlUtil.refreshPage();
  },

  help(): HelpInformation | null {
    return null;
  },
};

// noinspection JSUnusedGlobalSymbols
export default REBOOT;
