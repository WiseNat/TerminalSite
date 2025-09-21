import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import { DOMAIN, HOSTNAME, IP_ADDRESS } from "../../constant/system.ts";

const HOSTNAME_COMMAND: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("hostname", args, {
      boolean: ["d", "f", "i"],
      alias: {
        d: ["domain"],
        f: ["fqdn", "long"],
        i: ["ip-address"],
      },
    });

    if (parsedOptions === null) {
      return;
    }

    const output = getOutput({
      d: parsedOptions.d,
      f: parsedOptions.f,
      i: parsedOptions.i,
    });

    TerminalUtil.appendOutput(`\n${output}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default HOSTNAME_COMMAND;

interface Flags {
  d: boolean;
  f: boolean;
  i: boolean;
}

function getOutput(flags: Flags): string {
  if (flags.f) {
    return `${HOSTNAME}.${DOMAIN}`;
  }

  if (flags.d) {
    return DOMAIN;
  }

  if (flags.i) {
    return IP_ADDRESS;
  }

  return HOSTNAME;
}
