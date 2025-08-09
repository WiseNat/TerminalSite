import HtmlUtil from "./html_util.ts";
import { zeroWidthSpace } from "../constant/char.ts";

export default class TerminalUtil {
  /**
   * Retrieves the Input element from the DOM.
   * <p>
   * Used in place of a static readonly variable to allow Integration tests to work as expected.
   * @private
   */
  private static get input(): HTMLElement {
    return document.getElementById("input")!;
  }

  /**
   * Retrieves the Prompt element from the DOM.
   * <p>
   * Used in place of a static readonly variable to allow Integration tests to work as expected.
   * @private
   */
  private static get prompt(): HTMLElement {
    return document.getElementById("prompt")!;
  }

  /**
   * Retrieves the Output element from the DOM.
   * <p>
   * Used in place of a static readonly variable to allow Integration tests to work as expected.
   * @private
   */
  private static get output(): HTMLElement {
    return document.getElementById("output")!;
  }

  /**
   * @returns the Input element
   */
  public static getInputElement(): HTMLElement {
    return this.input;
  }

  /**
   * @returns the Prompt element
   */
  public static getPromptElement(): HTMLElement {
    return this.prompt;
  }

  /**
   * @returns the Output element
   */
  public static getOutputElement(): HTMLElement {
    return this.output;
  }

  /**
   * @returns the most recent data the user has inputted into the terminal, including any zero-width spaces
   * @see getInput
   */
  public static getRawInput(): string {
    return this.input.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.input.textContent);
  }

  /**
   * @returns the most recent data the user has inputted into the terminal, without any zero-width spaces
   * @see getRawInput
   */
  public static getInput(): string {
    return this.getRawInput().replace(zeroWidthSpace, "");
  }

  /**
   * @returns the current prompt, e.g. `C:\Users\user>`
   */
  public static getPrompt(): string {
    return this.prompt.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.prompt.textContent);
  }

  /**
   * @returns the output content of the terminal
   */
  public static getOutput() {
    return this.output.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.output.textContent);
  }

  /**
   * Sets the Input as the provided text and moves the cursor to the end.
   *
   * @param text text to set
   */
  public static setInput(text: string) {
    if (text === "") {
      text = zeroWidthSpace;
    }

    this.input.textContent = text;
    this.cursorToEnd();
  }

  /**
   * Sets the Prompt as the provided text.
   *
   * @param text text to set
   */
  public static setPrompt(text: string) {
    this.prompt.textContent = text;

    // Hidden prompt to ensure the Input element visibly starts after the prompt
    // CSS is marked with ? to fix failing tests
    const escapedPrompt = CSS?.escape(text);
    document.documentElement.style.setProperty(
      "--prompt-content",
      `"${escapedPrompt}"`,
    );
  }

  /**
   * Sets the Output as the provided text.
   *
   * @param text text to set
   */
  public static setOutput(text: string) {
    this.output.textContent = text;
  }

  /**
   * Appends the provided text to the end of the Input and moves the cursor to the end.
   * If the current input is a zero-width space, this will set instead of append.
   *
   * @param text text to append
   */
  public static appendInput(text: string) {
    if (this.getRawInput() === zeroWidthSpace) {
      this.setInput(text);
    } else {
      this.input.textContent += text;
      this.cursorToEnd();
    }
  }

  /**
   * Appends the provided text to the end of the Prompt.
   *
   * @param text text to append
   */
  public static appendPrompt(text: string) {
    this.prompt.textContent += text;
  }

  /**
   * Appends the provided text to the end of the Output.
   *
   * @param text text to append
   */
  public static appendOutput(text: string) {
    this.output.textContent += text;
  }

  /**
   * Moves the cursor to the end of the Input element's text.
   *
   * @see cursorToIndex
   */
  public static cursorToEnd() {
    // Insert a br tag to enable cursor to appear in the right position when the last character is a newline
    const children = this.input.childNodes;
    if (children.length > 0) {
      const last = children[children.length - 1];

      if (
        last.nodeType === Node.TEXT_NODE &&
        last.textContent?.endsWith("\n") &&
        !last.nextSibling
      ) {
        this.input.appendChild(document.createElement("br"));
      }
    }

    const lastTextNode = this.input.lastChild;
    const textLength = lastTextNode?.textContent?.length ?? 0;

    this.cursorToIndex(textLength);
  }

  /**
   * Moves the cursor to a specific position in the Input Element's text.
   * <p>
   * If moving to the end of the Input Element, use {@link cursorToEnd} to provide visual newlines.
   *
   * @param index the index to move the cursor to.
   */
  public static cursorToIndex(index: number) {
    const lastTextNode = this.input.lastChild;

    if (lastTextNode === null) {
      return;
    }

    const range = document.createRange();
    range.setStart(lastTextNode, index);
    range.setEnd(lastTextNode, index);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    this.input.focus();
  }
}
