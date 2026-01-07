import { CommandScript, Suggestion } from "../command_script.ts";
import { HelpInformation } from "./help.ts";
import CommandUtil from "../../util/command_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import FlavourUtil from "../../util/flavour_util.ts";
import { Flavour } from "../../flavour/flavour.ts";
import ThemeUtil from "../../util/theme_util.ts";

const TERMINAL: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("terminal", args, {
      boolean: ["L"],
      string: ["t", "f"],
      alias: {
        theme: ["t"],
        flavour: ["f"],
        list: ["L"],
      },
      default: {
        t: null,
        f: null,
      },
    });

    if (parsedOptions === null) {
      return;
    }

    if (
      parsedOptions.L === false &&
      parsedOptions.t === null &&
      parsedOptions.f === null
    ) {
      TerminalUtil.appendOutput(
        "terminal: No flags were provided. Run 'help terminal' for information on how to use this command.",
      );
      return;
    }

    if (parsedOptions.L === true) {
      listThemesAndFlavours();
    } else {
      if (parsedOptions.t !== null) {
        changeTheme(parsedOptions.t);
      }

      if (parsedOptions.f !== null) {
        changeFlavour(parsedOptions.f);
      }
    }
  },

  async autocomplete(
    userInput: string,
    args: string[],
  ): Promise<Suggestion[] | null> {
    if (args.length === 0) {
      return null;
    }

    let currentInput: string;
    let currentFlag: string;

    // Ensure that both of the following work:
    // 1. Empty arg, e.g. 'terminal -t '
    // 2. Non-empty arg, e.g. 'terminal -t D'
    if (userInput.endsWith(" ")) {
      currentInput = "";
      currentFlag = args.at(-1)!;
    } else if (args.length >= 2) {
      currentInput = args.at(-1)!;
      currentFlag = args.at(-2)!;
    } else {
      return null;
    }

    let searchValues: string[];

    if (["-t", "--theme"].includes(currentFlag)) {
      searchValues = ThemeUtil.getThemes();
    } else if (["-f", "--flavour"].includes(currentFlag)) {
      searchValues = FlavourUtil.getFlavours();
    } else {
      return null;
    }

    const suggestions: Suggestion[] = [];

    for (const searchValue of searchValues) {
      if (searchValue.startsWith(currentInput)) {
        suggestions.push({
          visual: searchValue,
          actual: `${searchValue} `.replace(currentInput, ""),
        });
      }
    }

    return suggestions;
  },

  help(): HelpInformation | null {
    return {
      synopsis:
        "terminal [-L|--list] [-t|--theme theme] [-f|--flavour flavour]",
      shortDescription: "Change Terminal Theme & Shell Flavour.",
      longDescription:
        "Changes the current Terminal Theme (colours) and/or Shell Flavour (text-appearance) from the current set value. Use 'terminal -L' to list all available Themes and Shell Flavours. " +
        "Setting the Shell Flavour only acts as a visual change and modifies the initial prompt and PS1 prompt. Changing the Shell Flavour does not modify the availability of commands, command functionality, the folder structure, or path naming conventions.",
      options: [
        {
          short: "f",
          long: "flavour=FLAVOUR",
          description: "sets the terminal's Shell Flavour to FLAVOUR",
        },
        {
          short: "L",
          long: "list",
          description: "lists all available Themes and Shell Flavours",
        },
        {
          short: "t",
          long: "theme=THEME",
          description: "sets the terminal's Theme to THEME",
        },
      ],
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default TERMINAL;

/**
 * Output all available Themes and Shell Flavours to the terminal.
 */
function listThemesAndFlavours() {
  const themes = ThemeUtil.getThemes();
  const flavours = FlavourUtil.getFlavours();

  let output = "";
  const joinString = "\n- ";

  output += "Themes:";
  if (themes.length === 0) {
    output += "\nNone";
  } else {
    output += `${joinString}${themes.join(joinString)}`;
  }

  output += "\n\nShell Flavours:";
  if (flavours.length === 0) {
    output += "\nNone";
  } else {
    output += `${joinString}${flavours.join(joinString)}`;
  }

  TerminalUtil.appendOutput(output);
}

/**
 * Attempt to change the Theme to the provided `theme`. Will output errors to
 * the terminal if the `theme` is invalid.
 *
 * @param theme name of the Theme to change to.
 */
function changeTheme(theme: string) {
  if (theme === "") {
    TerminalUtil.appendOutput(
      "terminal: No valid Theme was provided. Run 'terminal --list' to view all available Themes",
    );
    return;
  }

  const themes: string[] = ThemeUtil.getThemes();

  if (themes.length === 0) {
    TerminalUtil.appendOutput("terminal: No Themes are available");
    return;
  }

  if (!themes.includes(theme)) {
    TerminalUtil.appendOutput(
      `terminal: Theme '${theme}' is not valid. Run 'terminal --list' to view all available Themes`,
    );
    return;
  }

  ThemeUtil.setTheme(theme);

  TerminalUtil.appendOutput(`Changing Terminal Theme to '${theme}'`);
}

/**
 * Attempt to change the Shell Flavour to the provided `flavourName`. Will
 * output errors to the terminal if the `flavourName` is invalid.
 *
 * @param flavourName name of the Shell Flavour to change to.
 */
function changeFlavour(flavourName: string): void {
  if (flavourName === "") {
    TerminalUtil.appendOutput(
      "terminal: No valid Shell Flavour was provided. Run 'terminal --list' to view all available Flavours",
    );
    return;
  }

  const flavours: string[] = FlavourUtil.getFlavours();

  if (flavours.length === 0) {
    TerminalUtil.appendOutput("terminal: No Shell Flavours are available");
    return;
  }

  const flavour: Flavour | null = FlavourUtil.getShellFlavour(flavourName);

  if (flavour === null) {
    TerminalUtil.appendOutput(
      `terminal: Shell Flavour '${flavourName}' is not valid. Run 'terminal --list' to view all available Flavours`,
    );
    return;
  }

  FlavourUtil.setCurrentShellFlavour(flavour);

  TerminalUtil.appendOutput(`Changing Shell Flavour to '${flavourName}'`);
}
