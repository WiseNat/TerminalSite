// TODO: frontend tests for this

/**
 * Fires on a paste in the terminal.
 * <p>
 * Prevents rich formatting pastes.
 *
 * @param event paste event information
 */
export function paste(event: ClipboardEvent) {
  event.preventDefault();

  const text = event.clipboardData?.getData("text/plain") ?? "";

  /*
   * Deprecated though no good alternatives exist for pasting with proper undo history
   * When `contenteditable="plaintext-only"` becomes more mainstream, this can be removed.
   */
  document.execCommand("insertHTML", false, text);
}
