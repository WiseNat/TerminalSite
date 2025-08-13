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
        FileSystemUtil.setCurrentWorkingDirectory("/home/nathanwise/Desktop"); // TODO; "~/Desktop"

        // Act
        const resolvedPath = FileSystemUtil.resolvePathParts(path);

        // Assert
        expect(resolvedPath).toStrictEqual(expected);
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
