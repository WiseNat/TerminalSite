export default class HtmlUtil {
  /**
   * Normalises whitespace introduced by Browsers.
   * Currently, this includes Non-breaking Spaces (`\u00A0` & `&nbsp;`)
   * @param str
   */
  public static normaliseSpaces(str: string): string {
    return str.replaceAll("\u00A0", " ").replaceAll("&nbsp;", " ");
  }

  /**
   * Gets the position of the caret in the provided HTML node.
   *
   * @param node the node that contains the text caret.
   */
  public static getCaretPosition(node: Node) {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return 0;
    }

    const range = selection.getRangeAt(0);

    // Cloning range to ensure that no modifications are made to the current select
    const preRange = range.cloneRange();
    preRange.selectNodeContents(node);
    preRange.setEnd(range.endContainer, range.endOffset);

    return preRange.toString().length;
  }

  /**
   * Refreshes the current page.
   */
  public static refreshPage() {
    globalThis.location.reload();
  }

  /**
   * Extracts the visible text in the Browser for a given HTML String
   * @param html a HTML string
   * @returns the {@link innerText} of the HTML string.
   */
  public static extractVisibleText(html: string): string {
    const span = document.createElement("span");
    span.innerHTML = html;
    return span.innerText;
  }
}
