import { describe, expect, test } from "vitest";
import WINDOWS from "../../../../../src/flavour/implementation/Windows.ts";

describe("Windows", () => {
  // Redundant, returns a fixed string
  /*describe("getInitialPrompt", () => {});*/

  describe("getPrompt", () => {
    test("returns a valid prompt when given an normal path", () => {
      // Arrange
      const path = ["a", "b", "c"];

      // Act
      const prompt = WINDOWS.getPrompt(path);

      // Assert
      expect(prompt).toEqual({ value: "C:\\a\\b\\c>", isHTML: false });
    });

    test("returns a valid prompt when given an empty path", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const prompt = WINDOWS.getPrompt(path);

      // Assert
      expect(prompt).toEqual({ value: "C:\\>", isHTML: false });
    });
  });
});
