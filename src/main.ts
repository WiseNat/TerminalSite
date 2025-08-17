import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { keydown } from "./event/keydown.ts";
import { initialPrompt } from "./constant/prompt.ts";
import FileSystemUtil from "./util/file_system_util.ts";
import { click } from "./event/click.ts";

// Terminal Set-up
FileSystemUtil.setHomeDirectory("/home/nathanwise");
FileSystemUtil.setCurrentWorkingDirectory("~");

TerminalUtil.setOutput(initialPrompt);
TerminalUtil.setInput("");

// Event Listeners
document.addEventListener("click", click);

const inputElement = TerminalUtil.getInputElement();
inputElement.addEventListener("paste", paste);
inputElement.addEventListener("keydown", keydown);
