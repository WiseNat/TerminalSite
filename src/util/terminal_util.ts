export default class TerminalUtil {
  /**
   * Retrieves the terminal from the DOM. Used in place of a static readonly variable to allow Integration tests to work
   * as expected
   * @private
   */
  private static get terminal(): HTMLElement {
    return document.getElementById("terminal")!;
  }

  /**
   * @returns the terminal element
   */
  public static getTerminal(): HTMLElement {
    return this.terminal;
  }

  /**
   * @returns the current text content of the terminal
   * @see HTMLElement#textContent
   */
  public static getTerminalContent(): string {
    return this.terminal.textContent ?? "";
  }

  /**
   * Sets the terminal text as the provided text and moves the cursor to the end
   *
   * @param text text to set
   */
  public static setText(text: string) {
    this.terminal.textContent = text;
    this.cursorToEnd();
  }

  /**
   * Appends the provided text to the end of the terminal text and moves the cursor to the end
   *
   * @param text text to append
   */
  public static appendText(text: string) {
    this.terminal.textContent += text;
    this.cursorToEnd();
  }

  /**
   * Moves the cursor to the end of the terminals text.
   */
  public static cursorToEnd() {
    const range = document.createRange();
    range.selectNodeContents(this.terminal);
    range.collapse(false);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    this.terminal.focus();
  }
}
