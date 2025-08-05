// TODO: JSDoc
// TODO: unit test
export default class HtmlUtil {
  public static normaliseSpaces(str: string): string {
    return str.replace(/\u00A0/g, " ");
  }
}
