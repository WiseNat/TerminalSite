import { describe, expect, test } from "vitest";
import FileSystemUtil from "../../../../src/util/file_system_util";

describe("FileSystemUtil", () => {
  describe("joinPaths", () => {
    [
      {
        type: "joins just directories together",
        paths: ["home", "nathanwise", "Desktop"],
        expected: "home/nathanwise/Desktop",
      },
      {
        type: "joins paths that both start with a path separator",
        paths: ["/home/nathanwise", "/Desktop/subfolder"],
        expected: "/home/nathanwise/Desktop/subfolder",
      },
      {
        type: "joins paths that both end with a path separator",
        paths: ["home/nathanwise/", "Desktop/subfolder/"],
        expected: "home/nathanwise/Desktop/subfolder/",
      },
      {
        type: "joins paths that both start & end with a path separator",
        paths: ["/home/nathanwise/", "/Desktop/subfolder/"],
        expected: "/home/nathanwise/Desktop/subfolder/",
      },
      {
        type: "returns an empty string when no paths are provided",
        paths: [],
        expected: "",
      },
    ].forEach(({ type, paths, expected }) => {
      test(type, () => {
        // Arrange & Act
        const result = FileSystemUtil.joinPaths(...paths);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe("splitPaths", () => {
    [
      {
        type: "splits a path starting with a path separator",
        path: "/home/nathanwise/Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "splits a path not starting with a path separator",
        path: "home/nathanwise/Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "splits a path containing a current working directory symbol",
        path: "./Desktop/subfolder/",
        expected: [".", "Desktop", "subfolder"],
      },
      {
        type: "splits a path containing a parent directory symbol",
        path: "/home/nathanwise/../nathanwise/Desktop/subfolder/",
        expected: [
          "home",
          "nathanwise",
          "..",
          "nathanwise",
          "Desktop",
          "subfolder",
        ],
      },
      {
        type: "splits a path containing a home directory symbol",
        path: "~/Desktop/subfolder/",
        expected: ["~", "Desktop", "subfolder"],
      },
      {
        type: "returns an empty array when no path is provided",
        path: "",
        expected: [],
      },
    ].forEach(({ type, path, expected }) => {
      test(type, () => {
        // Arrange & Act
        const result = FileSystemUtil.splitPath(path);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

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
      type: string;
      path: string;
      expected: string[] | null;
    }

    const simpleTestCases: TestCase[] = [
      {
        type: "[Simple] a simple path",
        path: "/home/nathanwise/Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const parentDirectoryTestCases: TestCase[] = [
      {
        type: "[Parent Directory] a path ending with the parent directory symbol",
        path: "/home/nathanwise/Desktop/..",
        expected: ["home", "nathanwise"],
      },
      {
        type: "[Parent Directory] a path with multiple parent directory symbols",
        path: "/home/nathanwise/../nathanwise/Desktop/../../nathanwise/Desktop/..",
        expected: ["home", "nathanwise"],
      },
      {
        type: "[Parent Directory] a path that resolves above the root directory",
        path: "/home/../..",
        expected: [],
      },
    ];

    const homeDirectoryTestCases: TestCase[] = [
      {
        type: "[Home Directory] a path starting with the home directory symbol followed by a path separator",
        path: "~/Desktop/subfolder",
        expected: ["home", "nathanwise", "Desktop", "subfolder"],
      },
      {
        type: "[Home Directory]] a path starting with the home directory symbol followed by an invalid username",
        path: "~Desktop/subfolder",
        expected: null,
      },
      {
        type: "[Home Directory]] a path starting with the home directory symbol only followed by an invalid username",
        path: "~Desktop",
        expected: null,
      },
      {
        type: "[Home Directory] a path starting with the home directory symbol followed by 'nathanwise'",
        path: "~nathanwise/Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "[Home Directory] a path starting with the home directory symbol only followed by 'nathanwise'",
        path: "~nathanwise",
        expected: ["home", "nathanwise"],
      },
      {
        type: "[Home Directory] a path that is only a home directory symbol followed",
        path: "~",
        expected: ["home", "nathanwise"],
      },
      {
        type: "[Home Directory] a path that is only a home directory symbol followed by a path separator",
        path: "~/",
        expected: ["home", "nathanwise"],
      },
      {
        type: "[Home Directory] a path containing a home directory symbol not at the start",
        path: "/home/~/Desktop/subfolder",
        expected: ["home", "~", "Desktop", "subfolder"],
      },
    ];

    const currentWorkingDirectoryTestCases: TestCase[] = [
      {
        type: "[CWD] a path starting with the current working directory symbol",
        path: "./subfolder",
        expected: ["home", "nathanwise", "Desktop", "subfolder"],
      },
      {
        type: "[CWD] a path that is only a current working directory symbol",
        path: ".",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "[CWD] a path that is only a current working directory symbol followed by a path separator",
        path: "./",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "[CWD] a path containing a current working directory symbol not at the start",
        path: "/home/./nathanwise/Desktop/subfolder",
        expected: ["home", "nathanwise", "Desktop", "subfolder"],
      },
    ];

    const multipleSeparatorTestCases: TestCase[] = [
      {
        type: "[Multiple Separators] a path starting with multiple file separators",
        path: "//home/nathanwise/Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
      {
        type: "[Multiple Separators] a path containing multiple file separators",
        path: "/home///nathanwise//Desktop",
        expected: ["home", "nathanwise", "Desktop"],
      },
    ];

    const testCases: TestCase[] = [
      ...simpleTestCases,
      ...parentDirectoryTestCases,
      ...homeDirectoryTestCases,
      ...currentWorkingDirectoryTestCases,
      ...multipleSeparatorTestCases,
    ];

    testCases.forEach(({ type, path, expected }) => {
      test(type, () => {
        // Arrange
        FileSystemUtil.setHomeDirectory("/home/nathanwise");
        FileSystemUtil.setCurrentWorkingDirectory("~/Desktop");

        // Act
        const resolvedPath = FileSystemUtil.resolvePathParts(path);

        // Assert
        expect(resolvedPath).toStrictEqual(expected);
      });
    });
  });

  describe("isRelativePath", () => {
    [
      {
        type: "returns true for a path that starts with a directory",
        path: "Desktop/subfolder/",
        expected: true,
      },
      {
        type: "returns true for a path that starts with a file",
        path: "mydocument.txt",
        expected: true,
      },
      {
        type: "returns true for a path that is just a directory",
        path: "subfolder/",
        expected: true,
      },
      {
        type: "returns false for a path that starts with a / followed by a directory",
        path: "/Desktop/subfolder/",
        expected: false,
      },
      {
        type: "returns false for a path that starts with a / followed by a file",
        path: "/mydocument.txt",
        expected: false,
      },
      {
        type: "returns false for a path that starts with a / followed by the home directory symbol",
        path: "/~",
        expected: false,
      },
      {
        type: "returns true for a path that does not start with a / followed by the home directory symbol",
        path: "~",
        expected: true,
      },
      {
        type: "returns false for a path that starts with a / followed by the current working directory symbol",
        path: "/.",
        expected: false,
      },
      {
        type: "returns true for a path that does not start with a / followed by the current working directory symbol",
        path: ".",
        expected: true,
      },
      {
        type: "returns false for a path that starts with a / followed by the parent directory symbol",
        path: "/..",
        expected: false,
      },
      {
        type: "returns true for a path that does not start with a / followed by the parent directory symbol",
        path: "..",
        expected: true,
      },
    ].forEach(({ type, path, expected }) => {
      test(type, () => {
        // Arrange & Act
        const result = FileSystemUtil.isRelativePath(path);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe("normalisePath", () => {
    [
      {
        type: "returns the same relative path when no special symbols are present",
        path: "/home/nathanwise/Desktop",
        expected: "/home/nathanwise/Desktop",
      },
      {
        type: "returns the same absolute path when no special symbols are present",
        path: "/home/nathanwise/Desktop",
        expected: "/home/nathanwise/Desktop",
      },
      {
        type: "removes instances of the current working directory symbol",
        path: "./nathanwise/././Desktop",
        expected: "nathanwise/Desktop",
      },
      {
        type: "resolves instances of the parent directory symbol",
        path: "/home/../home/nathanwise/../../home/nathanwise/Desktop",
        expected: "/home/nathanwise/Desktop",
      },
    ].forEach(({ type, path, expected }) => {
      test(type, () => {
        // Arrange & Act
        const result = FileSystemUtil.normalisePath(path);

        // Assert
        expect(result).toEqual(expected);
      });
    });

    [
      {
        type: "retains the trailing dot when keepTrailingDot is true",
        path: "/home/nathanwise/./Projects/this/.",
        keepTrailingDot: true,
        expected: "/home/nathanwise/Projects/this/.",
      },
      {
        type: "does not retain the trailing dot when keepTrailingDot is false",
        path: "/home/nathanwise/./Projects/this/.",
        keepTrailingDot: false,
        expected: "/home/nathanwise/Projects/this",
      },
    ].forEach(({ type, path, keepTrailingDot, expected }) => {
      test(type, () => {
        // Arrange & Act
        const result = FileSystemUtil.normalisePath(path, keepTrailingDot);

        // Assert
        expect(result).toEqual(expected);
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
