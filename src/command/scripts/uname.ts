import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import {
  ARCHITECTURE,
  HOSTNAME,
  KERNEL_NAME,
  KERNEL_RELEASE,
  KERNEL_VERSION,
  OPERATING_SYSTEM,
} from "../../constant/system.ts";

const UNAME: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("hostname", args, {
      boolean: ["a", "s", "n", "r", "v", "m", "p", "i", "o"],
      alias: {
        a: ["all"],
        s: ["kernel-name"],
        n: ["nodename"],
        r: ["kernel-release"],
        v: ["kernel-version"],
        m: ["machine"],
        p: ["processor"],
        i: ["hardware-platform"],
        o: ["operating-system"],
      },
    });

    if (parsedOptions === null) {
      return;
    }

    const output = getOutput({
      s: parsedOptions.a ? true : parsedOptions.s,
      n: parsedOptions.a ? true : parsedOptions.n,
      r: parsedOptions.a ? true : parsedOptions.r,
      v: parsedOptions.a ? true : parsedOptions.v,
      m: parsedOptions.a ? true : parsedOptions.m,
      p: parsedOptions.a ? true : parsedOptions.p,
      i: parsedOptions.a ? true : parsedOptions.i,
      o: parsedOptions.a ? true : parsedOptions.o,
    });

    TerminalUtil.appendOutput(output);
  },
};

// noinspection JSUnusedGlobalSymbols
export default UNAME;

interface Flags {
  s: boolean;
  n: boolean;
  r: boolean;
  v: boolean;
  m: boolean;
  p: boolean;
  i: boolean;
  o: boolean;
}

function getOutput(flags: Flags): string {
  let output: string = "";

  if (flags.s) output += KERNEL_NAME + " ";
  if (flags.n) output += HOSTNAME + " ";
  if (flags.r) output += KERNEL_RELEASE + " ";
  if (flags.v) output += KERNEL_VERSION + " ";
  if (flags.m) output += ARCHITECTURE + " ";
  if (flags.p) output += ARCHITECTURE + " ";
  if (flags.i) output += ARCHITECTURE + " ";
  if (flags.o) output += OPERATING_SYSTEM;

  if (output === "") {
    output = KERNEL_NAME;
  }

  return output.trimEnd();
}
