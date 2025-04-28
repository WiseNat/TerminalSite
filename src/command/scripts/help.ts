import { CommandScript } from "../command_script.ts";

// TODO: Refactor this to be an actual help command
const HelpCommand: CommandScript = {
  run() {
    console.log("TEST");
  },
};

export default HelpCommand;
