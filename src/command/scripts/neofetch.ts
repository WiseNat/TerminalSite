import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import {
  BLACK,
  BLUE,
  BRIGHT_BLACK,
  BRIGHT_BLUE,
  BRIGHT_CYAN,
  BRIGHT_GREEN,
  BRIGHT_MAGENTA,
  BRIGHT_RED,
  BRIGHT_WHITE,
  BRIGHT_YELLOW,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
  WHITE,
  YELLOW,
} from "../../constant/colour.ts";
import FormatterUtil, {
  FileSystemEntryStyle,
} from "../../util/formatter_util.ts";
import CommandUtil from "../../util/command_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import {
  HOSTNAME,
  KERNEL_RELEASE,
  OPERATING_SYSTEM_RELEASE_PRETTY_NAME,
} from "../../constant/system.ts";
import Bowser from "bowser";
import { PerformanceMemory } from "../../types/non_standard";
import TimeUtil from "../../util/time_util.ts";
import { HelpInformation } from "./help.ts";

const NEOFETCH: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("neofetch", args, {
      boolean: ["L", "off"],
      alias: {
        logo: ["L"],
      },
    });

    if (parsedOptions === null) {
      return;
    }

    const output = getOutput({
      logo: parsedOptions["L"],
      info: parsedOptions["off"],
    });

    TerminalUtil.appendRawOutput(output);
  },

  help(): HelpInformation | null {
    return {
      synopsis: "neofetch [-L|--logo] [--off]",
      shortDescription: "A fast, highly customizable system info script.",
      longDescription:
        "Neofetch is a CLI system information tool written in JS. Neofetch displays information about your system next to your OS logo.",
      options: [
        {
          short: "L",
          long: "logo",
          description: "hide the info text and only show the ASCII logo",
        },
        {
          long: "off",
          description: "hide the ASCII logo and only show the info text",
        },
      ],
      additionalInformation:
        "When called without any flags, 'neofetch' will display both the ASCII logo and the info text.",
    };
  },
};

interface Flags {
  logo: boolean;
  info: boolean;
}

/**
 * Gets the output for Neofetch based on the provided flags.
 * The following is included:
 * - **No flags**: Logo, Info
 * - **Logo Flag**: Logo
 * - **Off Flag**: Info
 * - **Logo & Off Flags**: Nothing
 *
 * @param flags
 * @returns the output as a string
 */
function getOutput(flags: Flags): string {
  const columns: string[] = [];

  if (!flags.info) {
    const logo = getLogo();
    columns.push(logo);
  }

  if (!flags.logo) {
    const info = getInfo(!flags.info);
    columns.push(info);
  }

  const grid = FormatterUtil.toStaticColumns(columns, 3);

  if (grid === "") {
    return "\n ";
  }

  return grid + "\n\n ";
}

/**
 * Gets the ASCII Art Logo for Neofetch.
 * <p>
 * This was generated using 'ascii-image-converter terminal_white.png -c'
 * 'terminal_white.png' was generated in Inkscape from /public/terminal.svg with
 *   - White fill
 *   - 240px x 240px
 *   - 960 DPI
 *
 *  @returns the coloured ASCII art logo
 */
function getLogo() {
  return (
    toColouredText("`+-----------_`+------------+`_-----------+`", WHITE) +
    "\n" +
    toColouredText("*$$$$$$$$$$$$B<%$$$$$$$$$$$$8<@$$$$$$$$$$$$*", WHITE) +
    "\n" +
    toColouredText("$$$$$$$$$$$$$@i%$$$$$$$$$$$$%i@$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("YYYYYYYYXYYYYz>cYYYYYYYYYYYYc>zYYYYYYYYYYYYY", WHITE) +
    "\n" +
    toColouredText("######*W&#*##M8M############M8M#############", WHITE) +
    "\n" +
    toColouredText("$$$$$$$&a$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$*|^ ~Q$$$@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$b!    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$$O~    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$$$$0-`   +L%$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$$@$$hl '  ^k$$$$@@@@@@@@@@@@@@@$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$$$k1.   :v8$$$$$$$$$$$$$$$$$$$$$$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$h(.   :u&$$$$$$dQ0QQQQQQQQQQQ00#$$$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$w    :v8$$@$$$$@^               ($@$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$@q}iv8$$@$$$$$$$-:::::::::::::;:v$@$$$$", WHITE) +
    "\n" +
    toColouredText("$$$$$$$$$$$@$$$$$$$$$@%%%%%%%%%%%%%%%$$$$$$$", WHITE) +
    "\n" +
    toColouredText("*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*", WHITE) +
    "\n" +
    toColouredText("`+--------------------_______________-----+", WHITE)
  );
}

/**
 * Gets the Info segment of Neofetch containing a host of information.
 * @param isLogo whether the Logo is being printed or not
 * @returns the Info segment as a string
 */
function getInfo(isLogo: boolean): string {
  const browser = Bowser.getParser(globalThis.navigator.userAgent);

  let maximumMemory = "?";
  let currentMemory = "?";

  // Could change to rely on 'performance.measureUserAgentSpecificMemory' instead?
  // See https://developer.mozilla.org/en-US/docs/Web/API/Performance/measureUserAgentSpecificMemory
  if ("memory" in performance) {
    const performanceMemory: PerformanceMemory =
      performance.memory as PerformanceMemory;

    currentMemory = `${Math.ceil(performanceMemory.usedJSHeapSize / 1024)}`;
    maximumMemory = `${Math.ceil(performanceMemory.totalJSHeapSize / 1024)}`;
  } else if ("deviceMemory" in navigator) {
    maximumMemory = `${navigator.deviceMemory as number}`;
  }

  const browserName = browser.getBrowserName();
  const browserVersion = browser.getBrowserVersion();
  const engineName = browser.getEngineName();
  const engineVersion = browser.getEngine().version ?? "";

  const user = FileSystemUtil.username;
  const hostname = HOSTNAME;
  const os = OPERATING_SYSTEM_RELEASE_PRETTY_NAME;
  const motherboard = "Unknown";
  const kernel = KERNEL_RELEASE;
  const uptime = getUptime();
  const shell = "terminal-site 2.0";
  const resolution = `${document.body.clientWidth}x${document.body.clientHeight}`;
  console.warn(document.body.clientWidth);
  const desktopEnvironment = `${browserName === "" ? "Unknown" : browserName} ${browserVersion}`;
  const windowManager = `${engineName === "" ? "Unknown" : engineName} ${engineVersion}`;
  const terminal = "terminal-site";
  const cpu = `Unknown (${navigator.hardwareConcurrency ?? "?"}) @ ?GHz`;
  const gpu = "Unknown";
  const memory = `${currentMemory}B / ${maximumMemory}B`;

  return (
    `${toColouredText(user, BRIGHT_WHITE)}@${toColouredText(hostname, BRIGHT_WHITE)}` +
    "\n------------" +
    `\n${toColouredText("OS", WHITE)}: ${os}` +
    `\n${toColouredText("Host", WHITE)}: ${motherboard}` +
    `\n${toColouredText("Kernel", WHITE)}: ${kernel}` +
    `\n${toColouredText("Uptime", WHITE)}: ${uptime}` +
    `\n${toColouredText("Shell", WHITE)}: ${shell}` +
    `\n${toColouredText("Resolution", WHITE)}: ${resolution}` +
    `\n${toColouredText("DE", WHITE)}: ${desktopEnvironment}` +
    `\n${toColouredText("WM", WHITE)}: ${windowManager}` +
    `\n${toColouredText("Terminal", WHITE)}: ${terminal}` +
    `\n${toColouredText("CPU", WHITE)}: ${cpu}` +
    `\n${toColouredText("GPU", WHITE)}: ${gpu}` +
    `\n${toColouredText("Memory", WHITE)}: ${memory}` +
    `\n\n${getColouredBlocks(isLogo)}`
  );
}

/**
 * Gets the uptime based on how long the client has loaded the website for.
 *
 * @returns the uptime as a human-readable string.
 */
function getUptime(): string {
  const milliseconds = performance.now() - TimeUtil.loadTime;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor(totalSeconds / 3600);

  const formattedHours = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const formattedMinutes = `${minutes} ${minutes === 1 ? "min" : "mins"}`;
  const formattedSeconds = `${seconds} ${seconds === 1 ? "sec" : "secs"}`;

  if (hours && minutes) {
    return `${formattedHours}, ${formattedMinutes}`;
  }

  if (hours) {
    return `${formattedHours}`;
  }

  if (minutes && seconds) {
    return `${formattedMinutes}, ${formattedSeconds}`;
  }

  if (minutes) {
    return `${formattedMinutes}`;
  }

  return `${formattedSeconds}`;
}

/**
 * @returns the Coloured Background Blocks
 */
function getColouredBlocks(isLogo: boolean) {
  const colours: string[][] = [
    [BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE],
    [
      BRIGHT_BLACK,
      BRIGHT_RED,
      BRIGHT_GREEN,
      BRIGHT_YELLOW,
      BRIGHT_BLUE,
      BRIGHT_MAGENTA,
      BRIGHT_CYAN,
      BRIGHT_WHITE,
    ],
  ];

  const leftPadding = isLogo ? "" : " ";

  let colouredBlocks = `${leftPadding}`;
  for (const row of colours) {
    for (const colour of row) {
      colouredBlocks += toColouredBackground("   ", colour);
    }

    colouredBlocks += `\n${leftPadding}`;
  }

  return colouredBlocks.trimEnd();
}

/**
 * Creates a coloured foreground HTML span.
 *
 * @param text the inner span text.
 * @param colour the font colour.
 * @param isBold whether the font should be bold.
 */
function toColouredText(
  text: string,
  colour: string,
  isBold: boolean = true,
): string {
  return toSpan(text, {
    foreground: colour,
    background: null,
    fontWeight: isBold ? "bold" : null,
  });
}

/**
 * Creates a coloured background HTML span.
 *
 * @param text the inner span text.
 * @param colour the background colour.
 */
function toColouredBackground(text: string, colour: string): string {
  return toSpan(text, {
    foreground: null,
    background: colour,
    fontWeight: null,
  });
}

/**
 * Creates an HTML span.
 *
 * @param text the inner span text.
 * @param style the CSS style.
 */
function toSpan(text: string, style: FileSystemEntryStyle): string {
  const styleString = FormatterUtil.createStyleString(style);

  return `<span style='${styleString}'>${text}</span>`;
}

// noinspection JSUnusedGlobalSymbols
export default NEOFETCH;
