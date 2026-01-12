import { describe, expect, test } from "vitest";
import HtmlUtil from "../../../../src/util/html_util";

describe("HtmlUtil", () => {
  describe("normaliseSpaces", () => {
    test("normalises unicode no-break spaces into spaces", () => {
      // Arrange
      const input = "Hello\u00A0World";
      const expected = "Hello World";

      // Act
      const result = HtmlUtil.normaliseSpaces(input);

      // Assert
      expect(result).toEqual(expected);
    });

    test("normalises HTML entity no-break spaces into spaces", () => {
      // Arrange
      const input = "Hello&nbsp;World";
      const expected = "Hello World";

      // Act
      const result = HtmlUtil.normaliseSpaces(input);

      // Assert
      expect(result).toEqual(expected);
    });

    test("retains regular spaces", () => {
      // Arrange
      const input = "Hello World";
      const expected = "Hello World";

      // Act
      const result = HtmlUtil.normaliseSpaces(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
