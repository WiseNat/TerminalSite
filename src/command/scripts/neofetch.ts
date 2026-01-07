import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
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
import {
  ENTRY_FIVE,
  ENTRY_FIVE_BRIGHT,
  ENTRY_FOUR,
  ENTRY_FOUR_BRIGHT,
  ENTRY_ONE,
  ENTRY_ONE_BRIGHT,
  ENTRY_SEVEN,
  ENTRY_SEVEN_BRIGHT,
  ENTRY_SIX,
  ENTRY_SIX_BRIGHT,
  ENTRY_THREE,
  ENTRY_THREE_BRIGHT,
  ENTRY_TWO,
  ENTRY_TWO_BRIGHT,
  ENTRY_ZERO,
  ENTRY_ZERO_BRIGHT,
} from "../../constant/theme.ts";
import CssUtil from "../../util/css_util.ts";
import FlavourUtil from "../../util/flavour_util.ts";
import ThemeUtil from "../../util/theme_util.ts";

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
  const varEntrySeven = CssUtil.asVar(ENTRY_SEVEN);

  // prettier-ignore
  return (
    toColouredText("`+-----------_`+------------+`_-----------+`", varEntrySeven) +
    "\n" +
    toColouredText("*$$$$$$$$$$$$B<%$$$$$$$$$$$$8<@$$$$$$$$$$$$*", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$$$$$$$@i%$$$$$$$$$$$$%i@$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("YYYYYYYYXYYYYz>cYYYYYYYYYYYYc>zYYYYYYYYYYYYY", varEntrySeven) +
    "\n" +
    toColouredText("######*W&#*##M8M############M8M#############", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$&a$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$*|^ ~Q$$$@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$b!    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$O~    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$$$0-`   +L%$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$@$$hl '  ^k$$$$@@@@@@@@@@@@@@@$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$$k1.   :v8$$$$$$$$$$$$$$$$$$$$$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$h(.   :u&$$$$$$dQ0QQQQQQQQQQQ00#$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$w    :v8$$@$$$$@^               ($@$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$@q}iv8$$@$$$$$$$-:::::::::::::;:v$@$$$$", varEntrySeven) +
    "\n" +
    toColouredText("$$$$$$$$$$$@$$$$$$$$$@%%%%%%%%%%%%%%%$$$$$$$", varEntrySeven) +
    "\n" +
    toColouredText("*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*", varEntrySeven) +
    "\n" +
    toColouredText("`+--------------------_______________-----+", varEntrySeven)
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
  const currentTheme = ThemeUtil.getCurrentTheme();
  const currentShellFlavour = FlavourUtil.getShellFlavourName(
    FlavourUtil.getCurrentShellFlavour(),
  );

  const user = FileSystemUtil.username;
  const hostname = HOSTNAME;
  const os = OPERATING_SYSTEM_RELEASE_PRETTY_NAME;
  const motherboard = "Unknown";
  const kernel = KERNEL_RELEASE;
  const uptime = getUptime();
  const shell = "terminal-site 2.0";
  const resolution = `${document.body.clientWidth}x${document.body.clientHeight}`;
  const desktopEnvironment = `${browserName === "" ? "Unknown" : browserName} ${browserVersion}`;
  const windowManager = `${engineName === "" ? "Unknown" : engineName} ${engineVersion}`;
  const theme = currentTheme === "" ? "Unknown" : currentTheme;
  const shellFlavour = currentShellFlavour ?? "Unknown";
  const terminal = globalThis.location.hostname;
  const cpu = `Unknown (${navigator.hardwareConcurrency ?? "?"}) @ ?GHz`;
  const gpu = "Unknown";
  const memory = `${currentMemory}B / ${maximumMemory}B`;

  const varEntrySeven = CssUtil.asVar(ENTRY_SEVEN);
  const varEntrySevenBright = CssUtil.asVar(ENTRY_SEVEN_BRIGHT);

  return (
    `${toColouredText(user, varEntrySevenBright)}@${toColouredText(hostname, varEntrySevenBright)}` +
    "\n------------" +
    `\n${toColouredText("OS", varEntrySeven)}: ${os}` +
    `\n${toColouredText("Host", varEntrySeven)}: ${motherboard}` +
    `\n${toColouredText("Kernel", varEntrySeven)}: ${kernel}` +
    `\n${toColouredText("Uptime", varEntrySeven)}: ${uptime}` +
    `\n${toColouredText("Shell", varEntrySeven)}: ${shell}` +
    `\n${toColouredText("Resolution", varEntrySeven)}: ${resolution}` +
    `\n${toColouredText("DE", varEntrySeven)}: ${desktopEnvironment}` +
    `\n${toColouredText("WM", varEntrySeven)}: ${windowManager}` +
    `\n${toColouredText("Theme", varEntrySeven)}: ${theme}` +
    `\n${toColouredText("Shell Flavour", varEntrySeven)}: ${shellFlavour}` +
    `\n${toColouredText("Terminal", varEntrySeven)}: ${terminal}` +
    `\n${toColouredText("CPU", varEntrySeven)}: ${cpu}` +
    `\n${toColouredText("GPU", varEntrySeven)}: ${gpu}` +
    `\n${toColouredText("Memory", varEntrySeven)}: ${memory}` +
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
    [
      ENTRY_ZERO,
      ENTRY_ONE,
      ENTRY_TWO,
      ENTRY_THREE,
      ENTRY_FOUR,
      ENTRY_FIVE,
      ENTRY_SIX,
      ENTRY_SEVEN,
    ],
    [
      ENTRY_ZERO_BRIGHT,
      ENTRY_ONE_BRIGHT,
      ENTRY_TWO_BRIGHT,
      ENTRY_THREE_BRIGHT,
      ENTRY_FOUR_BRIGHT,
      ENTRY_FIVE_BRIGHT,
      ENTRY_SIX_BRIGHT,
      ENTRY_SEVEN_BRIGHT,
    ],
  ];

  const leftPadding = isLogo ? "" : " ";

  let colouredBlocks = `${leftPadding}`;
  for (const row of colours) {
    for (const colour of row) {
      colouredBlocks += toColouredBackground("   ", CssUtil.asVar(colour));
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
