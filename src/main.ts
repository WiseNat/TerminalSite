// TODO: Migrate events to separate files?
// TODO: Proper E2E testing with Selenium/Playwright/Cypress

import TerminalUtil from "./util/terminal_util.ts";
import Bowser from "bowser";

const terminal = TerminalUtil.getTerminal();

const initialPrompt =
  "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n";
const prompt = "C:\\Users\\user>";

TerminalUtil.setText(initialPrompt + "\n" + prompt);

// TODO: Update this when commands are processed
const readonlyIndex = TerminalUtil.getTerminalContent().length;

let contentBeforeInput = "";

terminal.addEventListener("paste", (event) => {
  const browser = Bowser.getParser(window.navigator.userAgent);

  /*
   * Firefox recently added support for contentEditable="plaintext-only". exeCommand safety net is being used to ensure
   * users with older Firefox browsers cannot paste rich formatted text.
   *
   * We only need to run the below for Firefox (+ fork) browsers but detecting those are a nightmare as Firefox is not
   * classified as an engine in Bowser; I'd need to know the browser name of every fork.
   *
   * Instead, as execCommand ONLY fails in Webkit, and it's easy to detect Webkit browsers as they're engines, the below
   * will run on every non-Webkit browser.
   *
   * This can be removed in 5-10 years time as contentEditable="plaintext-only" support will be in most Firefox users
   * browsers.
   */

  // Should work based on ENGINE_MAP in https://github.com/bowser-js/bowser/blob/master/src/constants.js
  if (browser.getEngineName() !== "WebKit") {
    event.preventDefault();

    // Added in case beforeinput does not fire from insertText call - varies per browser
    contentBeforeInput = TerminalUtil.getTerminalContent();

    // Deprecated though no good alternatives exist for pasting with proper undo history.
    const text = event.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
  }
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
