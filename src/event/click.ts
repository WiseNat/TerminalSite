import TerminalUtil from "../util/terminal_util.ts";

/**
 * Event listener function for handling click events in the terminal.
 *
 * @param event event listener {@link MouseEvent}
 */
export function click(event: MouseEvent) {
  // Deferring so that selected text can update properly
  setTimeout(() => {
    const input = TerminalUtil.getInputElement();

    // Allow selecting the input element using default browser behaviour
    // Allow clicking 'A' tags
    if (
      input.contains(event.target as Node) ||
      (event.target as HTMLElement).tagName === "A"
    ) {
      return;
    }

    const selection: Selection | null = globalThis.getSelection();

    // Allow text highlighting
    if (selection !== null && !selection.isCollapsed) {
      return;
    }

    event.preventDefault();

    input.focus();
    TerminalUtil.cursorToEnd();
  }, 0);
}
