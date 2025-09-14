import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { keydown } from "./event/keydown.ts";
import { INITIAL_PROMPT } from "./constant/prompt.ts";
import FileSystemUtil from "./util/file_system_util.ts";
import { click } from "./event/click.ts";

// Terminal Set-up
FileSystemUtil.setHomeDirectory("/home/nathanwise");
FileSystemUtil.setCurrentWorkingDirectory("~");

TerminalUtil.setOutput(INITIAL_PROMPT);
TerminalUtil.setInput("");

// Event Listeners
document.addEventListener("click", click);

const INPUT_ELEMENT = TerminalUtil.getInputElement();
INPUT_ELEMENT.addEventListener("paste", paste);
INPUT_ELEMENT.addEventListener("keydown", keydown);
