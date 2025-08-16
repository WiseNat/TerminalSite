export default class HtmlUtil {
  /**
   * Normalises whitespace introduced by Browsers.
   * Currently, this includes Non-breaking Spaces (`\u00A0` & `&nbsp;`)
   * @param str
   */
  public static normaliseSpaces(str: string): string {
    return str.replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ");
  }
}
