import { beforeEach, describe, expect, test } from "vitest";
import UNIX from "../../../../../src/flavour/implementation/Unix.ts";
import FileSystemUtil from "../../../../../src/util/file_system_util.ts";

describe("Unix", () => {
  beforeEach(() => {
    FileSystemUtil.setHomeDirectory("/a/b/home");
  });

  // Redundant, returns a fixed string
  /*describe("getInitialPrompt", () => {});*/

  describe("getPrompt", () => {
    test("returns a valid prompt when given an normal path", () => {
      // Arrange
      const path = ["a", "b", "c"];

      // Act
      const prompt = UNIX.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value:
          "<span style=\"color: var(--entry-2-bright); font-weight: bold\">nathanwise@portfolio</span>" +
          ":" +
          "<span style=\"color: var(--entry-4-bright); font-weight: bold\">/a/b/c</span>" +
          "$ ",
        isHTML: true,
      });
    });

    test("returns a valid prompt when given an empty path", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const prompt = UNIX.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value:
          "<span style=\"color: var(--entry-2-bright); font-weight: bold\">nathanwise@portfolio</span>" +
          ":" +
          "<span style=\"color: var(--entry-4-bright); font-weight: bold\">/</span>" +
          "$ ",
        isHTML: true,
      });
    });

    test("returns a valid prompt with the home directory path replaced with a '~' when given a path starting with the home directory", () => {
      // Arrange
      const path = ["a", "b", "home", "c"];

      // Act
      const prompt = UNIX.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value:
          "<span style=\"color: var(--entry-2-bright); font-weight: bold\">nathanwise@portfolio</span>" +
          ":" +
          "<span style=\"color: var(--entry-4-bright); font-weight: bold\">~/c</span>" +
          "$ ",
        isHTML: true,
      });
    });
  });
});
