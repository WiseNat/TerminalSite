// TODO: Migrate events to separate files?
// TODO: Proper E2E testing with Selenium/Playwright/Cypress

import TerminalUtil from "./util/terminal_util.ts";

const terminal = TerminalUtil.getTerminal();

const initialPrompt =
  "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n";
const prompt = "C:\\Users\\user>";

TerminalUtil.setText(initialPrompt + "\n" + prompt);

// TODO: Update this when commands are processed
const readonlyIndex = TerminalUtil.getTerminalContent().length;

let contentBeforeInput = "";

terminal.addEventListener("paste", (event) => {
  event.preventDefault();

  contentBeforeInput = TerminalUtil.getTerminalContent();

  // Deprecated though no good alternatives exist for pasting with proper undo history.
  // When `contenteditable="plaintext-only"` becomes more mainstream, this can be removed.
  const text = event.clipboardData?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, text);
});

terminal.addEventListener("beforeinput", () => {
  contentBeforeInput = TerminalUtil.getTerminalContent();
});

terminal.addEventListener("input", (event) => {
  const contentAfterInput = TerminalUtil.getTerminalContent();

  // Check if the readonly terminal sections do not match
  if (
    contentBeforeInput.substring(0, readonlyIndex) !=
    contentAfterInput.substring(0, readonlyIndex)
  ) {
    const inputEvent = event as InputEvent;

    // The following should never be null according to the spec: https://w3c.github.io/input-events/#overview
    const data =
      inputEvent.data ?? inputEvent.dataTransfer?.getData("text/plain") ?? "";

    // Reset to previous content and append user-inputted data to the end of the input
    TerminalUtil.setText(contentBeforeInput + data);
  }
});
