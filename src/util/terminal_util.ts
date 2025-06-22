// TODO: clean up this class
export default class TerminalUtil {
  private static readOnlyIndex: number = 0;
  private static previousContent: string = "";

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
    // Insert a br tag to enable cursor to appear in the right position when the last character is a newline
    const children = this.terminal.childNodes;
    if (children.length > 0) {
      const last = children[children.length - 1];

      if (
        last.nodeType === Node.TEXT_NODE &&
        last.textContent?.endsWith("\n") &&
        !last.nextSibling
      ) {
        this.terminal.appendChild(document.createElement("br"));
      }
    }

    const range = document.createRange();
    range.selectNodeContents(this.terminal);
    range.collapse();

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    this.terminal.focus();
  }

  /**
   * Updates the read only index of the terminal.
   * This defines where the current index is for the end of the read only
   * content in the terminal.
   *
   * @param index value to update to
   */
  public static setReadOnlyIndex(index: number) {
    this.readOnlyIndex = index;
  }

  /**
   * Retrieves the read-only content from the provided text.
   * Uses the tracked read-only index to pull this data.
   *
   * @param text the string to use or {@link this#getTerminalContent} if none is provided
   */
  public static getReadOnlyContent(text?: string): string {
    text ??= this.getTerminalContent();
    return text.substring(0, this.readOnlyIndex);
  }

  /**
   * @returns the previous content in the terminal, before the current changes were made
   */
  public static getPreviousContent() {
    return this.previousContent;
  }

  /**
   * @param previousContent sets the internal previous content to this or {@link this#getTerminalContent} if none is provided
   */
  public static updatePreviousContent(previousContent?: string) {
    previousContent ??= this.getTerminalContent();
    this.previousContent = previousContent;
  }
}
