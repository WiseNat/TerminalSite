import TerminalUtil from "./util/terminal_util.ts";
import { paste } from "./event/paste.ts";
import { beforeinput } from "./event/beforeinput.ts";
import { input } from "./event/input.ts";
import { keyup } from "./event/keyup.ts";

const initialPrompt =
  "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n";
const prompt = "C:\\Users\\user>";

TerminalUtil.setText(initialPrompt + "\n" + prompt);

// TODO: Update this when commands are processed
TerminalUtil.setReadOnlyIndex(TerminalUtil.getTerminalContent().length);

const terminal = TerminalUtil.getTerminal();
terminal.addEventListener("paste", paste);
terminal.addEventListener("beforeinput", beforeinput);
terminal.addEventListener("input", input);
terminal.addEventListener("keyup", keyup);
