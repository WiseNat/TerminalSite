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
  insertTextAtCursor(text);
}

/**
 * Inserts text at the user's cursor position.
 *
 * @param text text to insert
 */
function insertTextAtCursor(text: string) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return;
  }

  const textNode = document.createTextNode(text);

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(textNode);
  range.setStartAfter(textNode); // Move the caret after the inserted text node
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}
