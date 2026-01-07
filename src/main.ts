import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { keydown } from "./event/keydown.ts";
import FileSystemUtil from "./util/file_system_util.ts";
import { click } from "./event/click.ts";
import FlavourUtil from "./util/flavour_util.ts";
import UNIX from "./flavour/implementation/Unix.ts";
import { Flavour, TextContent } from "./flavour/flavour.ts";

// Terminal Set-up
const FLAVOUR: Flavour = UNIX;
FlavourUtil.setCurrentShellFlavour(FLAVOUR);

FileSystemUtil.setHomeDirectory(__HOME_DIRECTORY);
FileSystemUtil.setCurrentWorkingDirectory("~");

const INITIAL_PROMPT: TextContent = FLAVOUR.getInitialPrompt();
if (INITIAL_PROMPT.isHTML) {
  TerminalUtil.setRawOutput(INITIAL_PROMPT.value);
} else {
  TerminalUtil.setOutput(INITIAL_PROMPT.value);
}

TerminalUtil.setInput("");

// Event Listeners
document.addEventListener("click", click);

const INPUT_ELEMENT = TerminalUtil.getInputElement();
INPUT_ELEMENT.addEventListener("paste", paste);
INPUT_ELEMENT.addEventListener("keydown", keydown);
