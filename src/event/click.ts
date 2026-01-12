import TerminalUtil from "../util/terminal_util.ts";

/**
 * Event listener function for handling click events in the terminal.
 *
 * @param event event listener {@link MouseEvent}
 */
export function click(event: MouseEvent) {
  const input = TerminalUtil.getInputElement();

  if (
    input.contains(event.target as Node) ||
    (event.target as HTMLElement).tagName === "A"
  ) {
    return;
  }

  event.preventDefault();

  input.focus();
  TerminalUtil.cursorToEnd();
}
