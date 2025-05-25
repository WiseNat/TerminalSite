import { CommandScript } from "../command_script.ts";

// noinspection JSUnusedGlobalSymbols
export default {
  run(args: string[]) {
    const output = args.join(" ");

    // TODO: Change this to be visible to users, rather than the dev console
    console.log(output);
  },
} as CommandScript;
