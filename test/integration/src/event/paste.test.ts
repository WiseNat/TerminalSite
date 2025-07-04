import { describe, test } from "vitest";

describe("Paste Event", () => {
  describe("paste", () => {
    test("should update the previous content and paste for a non-WebKit browser", () => {
      // Unable to test this as the ClipboardEvent is not instantiatable with JSDom. See https://github.com/jsdom/jsdom/issues/1568
    });

    test("should do nothing for a WebKit browser", () => {
      // Unable to test this as the ClipboardEvent is not instantiatable with JSDom. See https://github.com/jsdom/jsdom/issues/1568
    });
  });
});
