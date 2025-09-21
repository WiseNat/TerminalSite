import { CommandScript } from "../command_script.ts";
import HtmlUtil from "../../util/html_util.ts";

const REBOOT: CommandScript = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(_args: string[]): Promise<void> {
    HtmlUtil.refreshPage();
  },
};

// noinspection JSUnusedGlobalSymbols
export default REBOOT;
