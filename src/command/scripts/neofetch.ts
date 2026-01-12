import { CommandScript } from "../command_script.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FormatterUtil from "../../util/formatter_util.ts";
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
  ENTRY_FIVE_PROPERTY,
  ENTRY_FIVE_BRIGHT_PROPERTY,
  ENTRY_FOUR_PROPERTY,
  ENTRY_FOUR_BRIGHT_PROPERTY,
  ENTRY_ONE_PROPERTY,
  ENTRY_ONE_BRIGHT_PROPERTY,
  ENTRY_SEVEN_PROPERTY,
  ENTRY_SEVEN_BRIGHT_PROPERTY,
  ENTRY_SIX_PROPERTY,
  ENTRY_SIX_BRIGHT_PROPERTY,
  ENTRY_THREE_PROPERTY,
  ENTRY_THREE_BRIGHT_PROPERTY,
  ENTRY_TWO_PROPERTY,
  ENTRY_TWO_BRIGHT_PROPERTY,
  ENTRY_ZERO_PROPERTY,
  ENTRY_ZERO_BRIGHT_PROPERTY,
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

interface StyledSpan {
  foreground: string | null;
  background: string | null;
  fontWeight: string | null;
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
  // prettier-ignore
  return (
    toBoldText("`+-----------_`+------------+`_-----------+`") +
    "\n" +
    toBoldText("*$$$$$$$$$$$$B<%$$$$$$$$$$$$8<@$$$$$$$$$$$$*") +
    "\n" +
    toBoldText("$$$$$$$$$$$$$@i%$$$$$$$$$$$$%i@$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("YYYYYYYYXYYYYz>cYYYYYYYYYYYYc>zYYYYYYYYYYYYY") +
    "\n" +
    toBoldText("######*W&#*##M8M############M8M#############") +
    "\n" +
    toBoldText("$$$$$$$&a$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$*|^ ~Q$$$@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$b!    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$$$O~    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$$$$$0-`   +L%$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$$$@$$hl '  ^k$$$$@@@@@@@@@@@@@@@$$$$$$$") +
    "\n" +
    toBoldText("$$$$$$$$k1.   :v8$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
    "\n" +
    toBoldText("$$$$$$h(.   :u&$$$$$$dQ0QQQQQQQQQQQ00#$$$$$$") +
    "\n" +
    toBoldText("$$$$$w    :v8$$@$$$$@^               ($@$$$$") +
    "\n" +
    toBoldText("$$$$$@q}iv8$$@$$$$$$$-:::::::::::::;:v$@$$$$") +
    "\n" +
    toBoldText("$$$$$$$$$$$@$$$$$$$$$@%%%%%%%%%%%%%%%$$$$$$$") +
    "\n" +
    toBoldText("*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*") +
    "\n" +
    toBoldText("`+--------------------_______________-----+")
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

  return (
    `${toBoldText(user)}@${toBoldText(hostname)}` +
    "\n------------" +
    `\n${toBoldText("OS")}: ${os}` +
    `\n${toBoldText("Host")}: ${motherboard}` +
    `\n${toBoldText("Kernel")}: ${kernel}` +
    `\n${toBoldText("Uptime")}: ${uptime}` +
    `\n${toBoldText("Shell")}: ${shell}` +
    `\n${toBoldText("Resolution")}: ${resolution}` +
    `\n${toBoldText("DE")}: ${desktopEnvironment}` +
    `\n${toBoldText("WM")}: ${windowManager}` +
    `\n${toBoldText("Theme")}: ${theme}` +
    `\n${toBoldText("Shell Flavour")}: ${shellFlavour}` +
    `\n${toBoldText("Terminal")}: ${terminal}` +
    `\n${toBoldText("CPU")}: ${cpu}` +
    `\n${toBoldText("GPU")}: ${gpu}` +
    `\n${toBoldText("Memory")}: ${memory}` +
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
      ENTRY_ZERO_PROPERTY,
      ENTRY_ONE_PROPERTY,
      ENTRY_TWO_PROPERTY,
      ENTRY_THREE_PROPERTY,
      ENTRY_FOUR_PROPERTY,
      ENTRY_FIVE_PROPERTY,
      ENTRY_SIX_PROPERTY,
      ENTRY_SEVEN_PROPERTY,
    ],
    [
      ENTRY_ZERO_BRIGHT_PROPERTY,
      ENTRY_ONE_BRIGHT_PROPERTY,
      ENTRY_TWO_BRIGHT_PROPERTY,
      ENTRY_THREE_BRIGHT_PROPERTY,
      ENTRY_FOUR_BRIGHT_PROPERTY,
      ENTRY_FIVE_BRIGHT_PROPERTY,
      ENTRY_SIX_BRIGHT_PROPERTY,
      ENTRY_SEVEN_BRIGHT_PROPERTY,
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
 * Creates a bold HTML span.
 *
 * @param text the inner span text.
 */
function toBoldText(text: string): string {
  return toSpan(text, {
    foreground: null,
    background: null,
    fontWeight: "bold",
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
function toSpan(text: string, style: StyledSpan): string {
  const styleString = createStyleString(style);

  return `<span style='${styleString}'>${text}</span>`;
}

/**
 * Creates an HTML CSS Style String for use in elements based on the provided
 * `style`.
 *
 * @param style the value to use to create the style string.
 * @returns an HTML CSS Style String.
 */
function createStyleString(style: StyledSpan) {
  return [
    style.foreground === null ? null : `color: ${style.foreground}`,
    style.background === null ? null : `background: ${style.background}`,
    style.fontWeight === null ? null : `font-weight: ${style.fontWeight}`,
  ]
    .filter(function (val) {
      return val !== null;
    })
    .join("; ");
}

// noinspection JSUnusedGlobalSymbols
export default NEOFETCH;
