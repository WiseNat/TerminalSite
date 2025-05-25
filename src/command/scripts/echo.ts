import LogUtil from "../../util/log_util.ts";
import { CommandScript } from "../command_script.ts";

// noinspection JSUnusedGlobalSymbols
export default {
  run(args: string[]) {
    const output = args.join(" ");

    LogUtil.info(output);
  },
} as CommandScript;
