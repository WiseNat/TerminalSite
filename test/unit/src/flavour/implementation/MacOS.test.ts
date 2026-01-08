import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import MACOS from "../../../../../src/flavour/implementation/MacOS.ts";
import FileSystemUtil from "../../../../../src/util/file_system_util.ts";

describe("MacOS", () => {
  beforeEach(() => {
    FileSystemUtil.setHomeDirectory("/a/b/home");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getInitialPrompt", () => {
    test("returns a valid initial prompt", () => {
      // Arrange
      const date = new Date(2000, 1, 1, 13);
      vi.setSystemTime(date);

      // Act
      const initialPrompt = MACOS.getInitialPrompt();

      // Assert
      expect(initialPrompt).toEqual({
        value: "Last login: Tue Feb  1 13:00:00 on console",
        isHTML: false,
      });
    });
  });

  describe("getPrompt", () => {
    test("returns a valid prompt when given a normal path", () => {
      // Arrange
      const path = ["a", "b", "c"];

      // Act
      const prompt = MACOS.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value: "nathanwise@portfolio c % ",
        isHTML: false,
      });
    });

    test("returns a valid prompt with '~' when given the home directory path", () => {
      // Arrange
      const path = ["a", "b", "home"];

      // Act
      const prompt = MACOS.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value: "nathanwise@portfolio ~ % ",
        isHTML: false,
      });
    });

    test("returns a valid prompt when given an empty path", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const prompt = MACOS.getPrompt(path);

      // Assert
      expect(prompt).toEqual({
        value: "nathanwise@portfolio / % ",
        isHTML: false,
      });
    });
  });
});
