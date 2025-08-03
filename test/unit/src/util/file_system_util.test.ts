import { describe, expect, test } from "vitest";
import FileSystemUtil from "../../../../src/util/file_system_util";

describe("FileSystemUtil", () => {
  describe("formatPath", () => {
    test("generic path should be valid", () => {
      // Arrange
      const path = ["home", "nathanwise", "Desktop"];

      // Act
      const result = FileSystemUtil.formatPath(path);

      // Assert
      const expected = "/home/nathanwise/Desktop";
      expect(result).toEqual(expected);
    });

    test("empty path should resolve to root", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.formatPath(path);

      // Assert
      const expected = "/";
      expect(result).toEqual(expected);
    });
  });

  describe("resolvePathParts", () => {
    interface TestCase {
      returns: string;
      when: string;
      paths: string[];
      expected: string[];
    }

    const preResolvedPathCases: TestCase[] = [
      {
        returns: "the same path",
        when: "given a single resolved path",
        paths: ["/home/nathanwise/Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "the paths merged",
        when: "given a resolved path NOT starting with '/' & NOT terminating with '/' and another directory",
        paths: ["home/nathanwise", "Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "the paths merged",
        when: "given a resolved path starting with '/' & NOT terminating with '/' and another directory",
        paths: ["/home/nathanwise", "Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "the paths merged",
        when: "given a resolved path NOT starting with '/' & terminating with '/' and another directory",
        paths: ["home/nathanwise/", "Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "the paths merged",
        when: "given a resolved path starting with '/' & terminating with '/' and another directory",
        paths: ["/home/nathanwise/", "Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const parentDirectoryCases: TestCase[] = [
      {
        returns: "the previous directory path",
        when: "given a path ending with '..'",
        paths: ["/home/nathanwise/Desktop/.."],
        expected: ["home", "nathanwise"],
      },
      {
        returns: "a valid path",
        when: "given a path with multiple '..'",
        paths: [
          "/home/nathanwise/../nathanwise/Desktop/../../nathanwise/Desktop/..",
        ],
        expected: ["home", "nathanwise"],
      },
      {
        returns: "the root directory",
        when: "given a path that resolves above the root directory",
        paths: ["/home/../.."],
        expected: [],
      },
      {
        returns: "a valid path",
        when: "given multiple paths with varying '..'",
        paths: [
          "/home/nathanwise/..",
          "../..",
          "home/../home/nathanwise",
          "../nathanwise/Desktop",
        ],
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const homeDirectoryCases: TestCase[] = [
      {
        returns: "the home directory",
        when: "given a path that is only '~'",
        paths: ["~"],
        expected: ["home", "nathanwise"],
      },
      {
        returns: "a path relative to the home directory",
        when: "given a path starting with '~'",
        paths: ["~/Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "a path containing '~'",
        when: "given a path including '~' not at the start",
        paths: ["/home/~/Desktop"],
        expected: ["home", "~", "Desktop"],
      },
      {
        returns: "a path relative to the home directory containing '~'",
        when: "given multiple paths that include '~', with the first having '~' at the start",
        paths: ["~/Desktop", "~/myfolder"],
        expected: ["home", "nathanwise", "Desktop", "~", "myfolder"],
      },
      {
        returns: "a path containing '~'",
        when: "given multiple paths that include '~', with the first not having '~' at the start",
        paths: ["/home/~", "~/Desktop"],
        expected: ["home", "~", "~", "Desktop"],
      },
    ];

    const currentDirectoryCases: TestCase[] = [
      {
        returns: "a path relative to the current working directory",
        when: "given a path starting with '.'",
        paths: ["./myfolder"],
        expected: ["home", "nathanwise", "Desktop", "myfolder"],
      },
      {
        returns: "a path ignoring '.'",
        when: "given a path including '.' not at the start",
        paths: ["/home/./nathanwise/Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "a path ignoring '.'",
        when: "given multiple paths that include '.', with the first having '.' at the start",
        paths: ["./myfolder", "subfolder/."],
        expected: ["home", "nathanwise", "Desktop", "myfolder", "subfolder"],
      },
      {
        returns: "a path ignoring '.'",
        when: "given multiple paths that include '.', with the first not having '.' at the start",
        paths: ["/home/nathanwise/.", "./Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const multipleSeparators: TestCase[] = [
      {
        returns: "a path without multiple '/'",
        when: "given a path starting with multiple '/'",
        paths: ["//home/nathanwise/Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "a path without multiple '/'",
        when: "given a path containing multiple '/'",
        paths: ["/home///nathanwise//Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "a path without multiple '/'",
        when: "given a path containing multiple '/'",
        paths: ["/home///nathanwise//Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        returns: "a path without multiple '/'",
        when: "given multiple paths containing multiple '/'",
        paths: ["///////home/nathanwise", "//Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const allCases = [
      ...preResolvedPathCases,
      ...parentDirectoryCases,
      ...homeDirectoryCases,
      ...currentDirectoryCases,
      ...multipleSeparators,
    ];

    allCases.forEach(({ returns, when, paths, expected }) => {
      test(`returns ${returns} when ${when}`, () => {
        // Arrange
        FileSystemUtil.setCurrentWorkingDirectory("~/Desktop");
        FileSystemUtil.setHomeDirectory("/home/nathanwise");

        // Act
        const resolvedPath = FileSystemUtil.resolvePathParts(...paths);

        // Assert
        expect(resolvedPath).toStrictEqual(expected);
      });
    });
  });

  describe("joinPaths", () => {
    interface TestCase {
      when: string;
      paths: string[];
      expected: string[];
    }

    const testCases: TestCase[] = [
      {
        when: "given a single path",
        paths: ["/home/nathanwise/Desktop"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        when: "given multiple paths",
        paths: ["/home/nathanwise/", "Desktop/"],
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        when: "given paths with multiple path separators",
        paths: ["home////nathanwise", "/Desktop///", "/myfolder//subfolder"],
        expected: ["home", "nathanwise", "Desktop", "myfolder", "subfolder"],
      },
      {
        when: "given a single file",
        paths: ["test"],
        expected: [".", "test"],
      },
    ];

    testCases.forEach(({ when, paths, expected }) => {
      test(`when ${when}, returns ${expected}`, () => {
        // Arrange
        FileSystemUtil.setCurrentWorkingDirectory("/home/nathanwise");

        // Act
        const result = FileSystemUtil.joinPaths(...paths);

        // Assert
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe("walkFileTree", () => {
    test("returns node for a valid path", () => {
      // Arrange
      const path = ["src", "main", "foo"];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toMatchSnapshot();
    });

    test("returns root node for an empty path", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toMatchSnapshot();
    });

    test("returns null node for non-existent path", () => {
      // Arrange
      const path: string[] = ["some", "fake", "path"];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).toBeNull();
    });
  });
});
