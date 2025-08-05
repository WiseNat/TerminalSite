import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { keydown } from "./event/keydown.ts";
import { initialPrompt, userPrompt } from "./constant/prompt.ts";
import FileSystemUtil from "./util/file_system_util.ts";

FileSystemUtil.setHomeDirectory("/home/nathanwise");
FileSystemUtil.setCurrentWorkingDirectory("~");

TerminalUtil.setOutput(initialPrompt);
TerminalUtil.setPrompt(userPrompt);
TerminalUtil.setInput("");

const inputElement = TerminalUtil.getInputElement();
inputElement.addEventListener("paste", paste);
inputElement.addEventListener("keydown", keydown);
