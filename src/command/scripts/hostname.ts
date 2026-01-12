import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import { DOMAIN, HOSTNAME, IP_ADDRESS } from "../../constant/system.ts";
import { HelpInformation } from "./help.ts";

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

    TerminalUtil.appendOutput(output);
  },

  help(): HelpInformation | null {
    return {
      synopsis:
        "hostname: hostname [-d|--domain] [-f|--fqdn|--long] [-i|--ip-address]",
      shortDescription: "Show the system's host name.",
      options: [
        {
          short: "d",
          description: "display the name of the DNS domain",
        },
        {
          short: "f",
          description:
            "display the FQDN (Fully Qualified Domain Name). A FQDN consists of a short host name and the DNS domain name",
        },
        {
          short: "i",
          description:
            "display the network address(es) of the host name. Note that this works only if the host name can be resolved",
        },
      ],
      additionalInformation:
        "When called without any flags, 'hostname' will display the short host name.",
    };
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
