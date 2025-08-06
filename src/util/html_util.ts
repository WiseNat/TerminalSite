export default class HtmlUtil {
  /**
   * Normalises whitespace introduced by Browsers.
   * Currently, this only includes Non-breaking Spaces (`\u00A0`)
   * @param str
   */
  public static normaliseSpaces(str: string): string {
    return str.replace(/\u00A0/g, " ");
  }
}
