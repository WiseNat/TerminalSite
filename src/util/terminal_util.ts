import HtmlUtil from "./html_util.ts";
import { ZERO_WIDTH_SPACE } from "../constant/char.ts";
import { escape, unescape } from "lodash-es";
import FileSystemUtil from "./file_system_util.ts";

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
   * @returns the output content of the terminal, including unescaped nested HTML elements
   */
  public static getRawOutput(): string {
    return this.output.innerHTML === null
      ? ""
      : HtmlUtil.normaliseSpaces(this.output.innerHTML);
  }

  /**
   * @returns the most recent data the user has inputted into the terminal, without any zero-width spaces
   * @see getRawInput
   */
  public static getInput(): string {
    return this.getRawInput().replace(ZERO_WIDTH_SPACE, "");
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
   * @returns the output content of the terminal, with nested HTML elements unescaped
   */
  public static getOutput() {
    return unescape(this.getRawOutput());
  }

  /**
   * Sets the Input as the provided text and moves the cursor to the end.
   *
   * @param text text to set
   */
  public static setInput(text: string) {
    if (text === "") {
      text = ZERO_WIDTH_SPACE;
    }

    this.input.textContent = text;
    this.cursorToEnd();
    this.scrollTo("end");
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
   * Sets the prompt using the provided path.
   *
   * @param path
   */
  public static setPromptPath(path: string) {
    const splitPath = FileSystemUtil.splitPath(path);

    const pathSeparator = "\\";
    const prompt = `C:${pathSeparator}${splitPath.join(pathSeparator)}>`;

    this.setPrompt(prompt);
  }

  /**
   * Sets the `innerHtml` of the Output as the escaped version of the given text.
   * <p>
   * This allows for safely setting text that may contain HTML characters. For inserting HTML elements, use {@link setRawOutput}.
   *
   * @param text text to escape and set
   */
  public static setOutput(text: string) {
    this.output.innerHTML = escape(text);
    this.scrollTo("start");
  }

  /**
   * Sets the `innerHtml` of the Output as this text.
   * <p>
   * This allows for inserting of HTML elements. For inserting regular text safely, use {@link setOutput}.
   *
   * @param text text to set
   */
  public static setRawOutput(text: string) {
    this.output.innerHTML = text;
    this.scrollTo("start");
  }

  /**
   * Appends the provided text to the end of the Input and moves the cursor to the end.
   * If the current input is a zero-width space, this will set instead of append.
   *
   * @param text text to append
   */
  public static appendInput(text: string) {
    if (this.getRawInput() === ZERO_WIDTH_SPACE) {
      this.setInput(text);
    } else {
      this.input.textContent += text;
      this.cursorToEnd();
      this.scrollTo("end");
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
   * Appends the provided text - after escaping it - to the end of the Output.
   * <p>
   * This allows for safely appending text that may contain HTML characters. For appending HTML elements, use {@link appendRawOutput}.
   *
   * @param text text to escape & append
   * @param onNewLine whether to append the text so that it is on a new line
   */
  public static appendOutput(text: string, onNewLine?: boolean) {
    this.appendRawOutput(escape(text), onNewLine);
  }

  /**
   * Appends the provided text to the end of the Output.
   * <p>
   * This allows for appending HTML elements. For regular text safe appends, use {@link appendOutput}.
   *
   * @param text text to append
   * @param onNewLine whether to append the text so that it is on a new line
   */
  public static appendRawOutput(text: string, onNewLine?: boolean) {
    if (onNewLine !== null && onNewLine && TerminalUtil.getOutput() !== "") {
      text = `\n${text}`;
    }

    this.output.innerHTML += text;

    this.scrollTo("start");
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

  /**
   * Scrolls instantly to a part of the Input element, based on the provided `block`.
   *
   * @param block see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#block
   */
  public static scrollTo(block: ScrollLogicalPosition | undefined) {
    this.input.scrollIntoView({ behavior: "instant", block: block });
  }
}
