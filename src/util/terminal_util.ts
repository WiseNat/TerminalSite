// TODO: update JSDocs

import HtmlUtil from "./html_util.ts";

export default class TerminalUtil {
  /**
   * Retrieves the Input element from the DOM. Used in place of a static readonly variable to allow Integration tests to work
   * as expected
   * @private
   */
  private static get input(): HTMLElement {
    return document.getElementById("input")!;
  }

  /**
   * Retrieves the Prompt element from the DOM. Used in place of a static readonly variable to allow Integration tests to work
   * as expected
   * @private
   */
  private static get prompt(): HTMLElement {
    return document.getElementById("prompt")!;
  }

  /**
   * Retrieves the Output element from the DOM. Used in place of a static readonly variable to allow Integration tests to work
   * as expected
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
   * @returns the most recent data the user has inputted into the terminal; anything after the read only content
   */
  public static getInput(): string {
    return this.input.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.input.textContent);
  }

  // TODO: JSDoc
  public static getPrompt(): string {
    return this.prompt.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.prompt.textContent);
  }

  /**
   * @returns the current text content of the terminal
   * @see HTMLElement#textContent
   */
  public static getOutput() {
    return this.output.textContent === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.output.textContent);
  }

  // TODO: unit test
  // TODO: JSDoc
  public static setInput(text: string) {
    this.input.textContent = text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  // TODO: unit test
  // TODO: JSDoc
  public static setPrompt(text: string) {
    this.prompt.textContent = text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  /**
   * Sets the terminal text as the provided text and moves the cursor to the end
   *
   * @param text text to set
   */
  public static setOutput(text: string) {
    this.output.textContent = text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  // TODO: unit test
  // TODO: JSDoc
  public static appendInput(text: string) {
    this.input.textContent += text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  // TODO: unit test
  // TODO: JSDoc
  public static appendPrompt(text: string) {
    this.prompt.textContent += text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  /**
   * Appends the provided text to the end of the terminal text and moves the cursor to the end
   *
   * @param text text to append
   */
  public static appendOutput(text: string) {
    this.output.textContent += text;
    // TODO: redundant?
    this.cursorToEnd();
  }

  /**
   * Moves the cursor to the end of the terminals text.
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
   * Moves the cursor to a position in the terminals text. If moving to the end
   * of the terminal, use {@link cursorToEnd} to provide visual newlines.
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
