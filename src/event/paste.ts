import Bowser from "bowser";
import TerminalUtil from "../util/terminal_util.ts";

/**
 * Event listener function for preventing rich-formatted text pasting on paste calls.
 *
 * Firefox recently added support for contentEditable="plaintext-only". execCommand safety net is being used to ensure
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
 *
 * @param event event listener {@link ClipboardEvent}
 */
export function paste(event: ClipboardEvent) {
  const browser = Bowser.getParser(window.navigator.userAgent);

  // Should work based on ENGINE_MAP in https://github.com/bowser-js/bowser/blob/master/src/constants.js
  if (browser.getEngineName() !== "WebKit") {
    event.preventDefault();

    // Added in case beforeinput does not fire from insertText call - varies per browser
    TerminalUtil.updatePreviousContent();

    // Deprecated though no good alternatives exist for pasting with proper undo history.
    const text = event.clipboardData?.getData("text/plain") ?? "";
    // noinspection JSDeprecatedSymbols
    document.execCommand("insertText", false, text); // NOSONAR
  }
}
