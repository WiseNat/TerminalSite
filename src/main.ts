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
TerminalUtil.setReadOnlyIndex(TerminalUtil.getTerminalContent().length);

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
    TerminalUtil.updatePreviousContent();

    // Deprecated though no good alternatives exist for pasting with proper undo history.
    const text = event.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
  }
});

terminal.addEventListener("beforeinput", () => {
  TerminalUtil.updatePreviousContent();
});

terminal.addEventListener("input", (event) => {
  const inputEvent = event as InputEvent;
  const previousContent = TerminalUtil.getPreviousContent();
  const currentReadOnlyContent = TerminalUtil.getReadOnlyContent();

  // Check if the readonly terminal sections do not match
  if (
    TerminalUtil.getReadOnlyContent(previousContent) != currentReadOnlyContent
  ) {
    const data = getInsertedDataFromInputEvent(inputEvent);

    // Reset to previous content and append user-inputted data to the end of the input
    TerminalUtil.setText(previousContent + data);
  } else if (
    inputEvent.inputType === "insertLineBreak" ||
    inputEvent.inputType === "insertParagraph"
  ) {
    // Safe-guarding against uncaught newlines - should trigger for all browsers except Firefox

    if (
      TerminalUtil.getReadOnlyContent(terminal.innerText) !=
      currentReadOnlyContent
    ) {
      // Reset to previous content and append newline to the end of the input
      // Carriage returns ("\r") will be treated as newlines
      TerminalUtil.setText(previousContent + "\n");
    }
  }
});

/**
 * Retrieves the inserted data safely from the provided {@link InputEvent}.
 * Uses the following spec: https://w3c.github.io/input-events/#overview
 *
 * @param inputEvent event to pull the data from
 */
function getInsertedDataFromInputEvent(inputEvent: InputEvent) {
  // Newlines are inexplicably excluded from data and dataTransfer
  if (inputEvent.inputType === "insertLineBreak") {
    return "\n";
  }

  return (
    inputEvent.data ?? inputEvent.dataTransfer?.getData("text/plain") ?? ""
  );
}
