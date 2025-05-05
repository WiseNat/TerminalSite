import { CommandScript } from "../command_script.ts";

const EchoCommand: CommandScript = {
  run(args: string[]) {
    const output = args.join(" ");

    // TODO: Change this to be visible to users, rather than the dev console
    console.log(output);
  },
};

export default EchoCommand;
