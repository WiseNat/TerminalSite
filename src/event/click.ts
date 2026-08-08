import TerminalUtil from "../util/terminal_util.ts";
import Bowser from "bowser";

/**
 * Event listener function for handling click events in the terminal.
 *
 * @param event event listener {@link MouseEvent}
 */
export function click(event: MouseEvent) {
  const input = TerminalUtil.getInputElement();

  // Allow selecting the input element using default browser behaviour
  // Allow clicking 'A' tags
  if (
    input.contains(event.target as Node) ||
    (event.target as HTMLElement).tagName === "A"
  ) {
    return;
  }

  const browser = Bowser.getParser(window.navigator.userAgent);
  const focusInput = (event: MouseEvent, input: HTMLElement) => {
    event.preventDefault();
    input.focus();
    TerminalUtil.cursorToEnd();
  };

  if (browser.isOS("iOS")) {
    // iOS does not allow focusing an input Element when deferring inside 'setTimeout', so we cannot check if the text
    // selection exists or not, and we instead just focus the input.
    //
    // Text selection does seem to work regardless.
    focusInput(event, input);
  } else {
    // Deferring so that selected text can update properly
    setTimeout(() => {
      const selection: Selection | null = globalThis.getSelection();

      // Allow text highlighting
      if (selection !== null && !selection.isCollapsed) {
        return;
      }

      focusInput(event, input);
    }, 0);
  }
}
