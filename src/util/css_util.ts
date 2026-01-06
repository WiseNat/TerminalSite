export default class CssUtil {
  /**
   * @param element the HTML element to get the style for.
   * @returns the CSS Style for the given `element`
   */
  public static getStyle(element: Element): CSSStyleDeclaration {
    return globalThis.getComputedStyle(element);
  }

  /**
   * Estimates the character width for the provided font.
   *
   * @param font a CSS font, see https://developer.mozilla.org/en-US/docs/Web/CSS/font
   * @param char an alternative character to use. If the font is monospace, this does not need to be provided.
   * @returns the estimated width as a decimal number or null if it failed to be estimated.
   */
  public static getCharacterWidth(
    font: string,
    char: string = "M",
  ): number | null {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context === null) {
      return null;
    }

    context.font = font;
    return context.measureText(char).width;
  }

  /**
   * Gets the {@link HTMLElement.offsetWidth} of the provided `element`.
   * This has been abstracted away to support unit test mocking as JSDom does
   * not support this attribute as per https://github.com/jsdom/jsdom/issues/135
   *
   * @param element the element to get the offset width of.
   */
  public static getElementWidth(element: HTMLElement): number {
    return element.offsetWidth;
  }

  /**
   * @param property the property to convert to a var, can start with or without '--'
   * @return the `property` as a var in CSS, e.g. `CssUtil.asVar("foo") // -> "var(--foo)"`
   */
  public static asVar(property: string): string {
    if (!property.startsWith("--")) {
      property = `--${property}`;
    }

    return `var(${property})`;
  }
}
