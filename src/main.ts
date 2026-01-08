import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { keydown } from "./event/keydown.ts";
import FileSystemUtil from "./util/file_system_util.ts";
import { click } from "./event/click.ts";
import FlavourUtil from "./util/flavour_util.ts";
import ThemeUtil from "./util/theme_util.ts";

/* Terminal Set-up */
FlavourUtil.setup();
ThemeUtil.setup();

FileSystemUtil.setHomeDirectory(__HOME_DIRECTORY);
FileSystemUtil.setCurrentWorkingDirectory("~");

TerminalUtil.setInput("");

/* Event Listeners */
document.addEventListener("click", click);

const INPUT_ELEMENT = TerminalUtil.getInputElement();
INPUT_ELEMENT.addEventListener("paste", paste);
INPUT_ELEMENT.addEventListener("keydown", keydown);
