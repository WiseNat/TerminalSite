import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { beforeinput } from "./event/beforeinput.ts";
import { input } from "./event/input.ts";
import { keydown } from "./event/keydown.ts";
import { initialPrompt, userPrompt } from "./constant/prompt.ts";

TerminalUtil.setText(initialPrompt + "\n" + userPrompt);
TerminalUtil.updateReadOnlyIndex();

const terminal = TerminalUtil.getTerminal();
terminal.addEventListener("paste", paste);
terminal.addEventListener("beforeinput", beforeinput);
terminal.addEventListener("input", input);
terminal.addEventListener("keydown", keydown);
