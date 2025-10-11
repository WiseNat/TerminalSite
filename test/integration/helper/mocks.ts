import { vi } from "vitest";
import HtmlUtil from "../../../src/util/html_util.ts";

export function mockExtractVisibleText() {
  return vi.mocked(HtmlUtil.extractVisibleText).mockImplementation((html) => {
    // Does not work with all HTML, just a rough solution as JSDom does not support innerText
    return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
  });
}
