import { beforeEach, describe, expect, test, vi } from "vitest";
import ThemeUtil from "../../../../src/util/theme_util.ts";

describe("ThemeUtil", () => {
  let document: { documentElement: { dataset: { theme: string | null } } };

  beforeEach(() => {
    document = {
      documentElement: {
        dataset: {
          theme: null,
        },
      },
    };

    vi.unstubAllGlobals();
    vi.stubGlobal("document", document);
  });

  describe("setup", () => {
    test("Given no stored theme, should not set a theme", () => {
      vi.stubGlobal("sessionStorage", {
        getItem: () => null,
      });

      // Act
      ThemeUtil.setup();

      // Assert
      expect(document.documentElement.dataset.theme).toBeNull();
    });

    test("Given a stored theme that is valid, should set the theme as the stored value", () => {
      const theme = "THEME_3";
      vi.stubGlobal("sessionStorage", {
        getItem: () => theme,
        setItem: () => {},
      });
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
      }));

      // Act
      ThemeUtil.setup();

      // Assert
      expect(document.documentElement.dataset.theme).toEqual(theme);
    });

    test("Given a stored theme that is not valid, should set the theme as the stored value", () => {
      const theme = "FOO";
      vi.stubGlobal("sessionStorage", {
        getItem: () => theme,
      });
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
      }));

      // Act
      ThemeUtil.setup();

      // Assert
      expect(document.documentElement.dataset.theme).toBeNull();
    });
  });

  describe("getThemes", () => {
    test("Given property value --themes exists, should return a list of themes", () => {
      // Arrange
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
      }));

      // Act
      const themes = ThemeUtil.getThemes();

      // Assert
      expect(themes).toStrictEqual([
        "THEME_1",
        "THEME_2",
        "THEME_3",
        "THEME_4",
      ]);
    });

    test("Given property value --themes does not exist, should return an empty list", () => {
      // Arrange
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "",
      }));

      // Act
      const themes = ThemeUtil.getThemes();

      // Assert
      expect(themes).toStrictEqual([]);
    });
  });

  describe("setTheme", () => {
    test("Given a valid theme, should set the theme as the provided value and store it", () => {
      const theme = "THEME_3";
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
      }));

      const setItemSpy = vi.fn();
      vi.stubGlobal("sessionStorage", {
        setItem: setItemSpy,
      });

      // Act
      ThemeUtil.setTheme(theme);

      // Assert
      expect(document.documentElement.dataset.theme).toEqual(theme);
      expect(setItemSpy).toHaveBeenCalledExactlyOnceWith("theme", theme);
    });

    test("Given an invalid theme, should not set the theme as the provided value", () => {
      const theme = "FOO";
      vi.stubGlobal("getComputedStyle", () => ({
        getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
      }));

      // Act
      ThemeUtil.setTheme(theme);

      // Assert
      expect(document.documentElement.dataset.theme).toBeNull();
    });
  });
});
