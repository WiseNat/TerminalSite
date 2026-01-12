import { describe, expect, test, vi } from "vitest";
import FileSystemUtil from "../../../../src/util/file_system_util";
import { FileTreeNode } from "virtual:file-tree";

describe("FileSystemUtil", () => {
  // Mocks
  vi.mock("../../../../src/util/terminal_util");

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
      expect(result).toMatchInlineSnapshot(`
        {
          "blocks": 8,
          "children": [
            {
              "blocks": 8,
              "children": [],
              "group": "nathanwise",
              "isDirectory": true,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "bar",
              "owner": "nathanwise",
              "path": "src/main/foo",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
            {
              "blocks": 12,
              "group": "nathanwise",
              "isDirectory": false,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "daz",
              "owner": "nathanwise",
              "path": "src/main/foo",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
            {
              "blocks": 23,
              "group": "nathanwise",
              "isDirectory": false,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "bazzing.gaz",
              "owner": "nathanwise",
              "path": "src/main/foo",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
          ],
          "group": "nathanwise",
          "isDirectory": true,
          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
          "name": "foo",
          "owner": "nathanwise",
          "path": "src/main",
          "permissions": [
            6,
            6,
            4,
          ],
          "size": 0,
        }
      `);
    });

    test("returns node for a valid single directory with children", () => {
      // Arrange
      const path = ["src"];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toMatchInlineSnapshot(`
        {
          "blocks": 8,
          "children": [
            {
              "blocks": 8,
              "children": [
                {
                  "blocks": 8,
                  "children": [
                    {
                      "blocks": 8,
                      "children": [],
                      "group": "nathanwise",
                      "isDirectory": true,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "bar",
                      "owner": "nathanwise",
                      "path": "src/main/foo",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 12,
                      "group": "nathanwise",
                      "isDirectory": false,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "daz",
                      "owner": "nathanwise",
                      "path": "src/main/foo",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 23,
                      "group": "nathanwise",
                      "isDirectory": false,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "bazzing.gaz",
                      "owner": "nathanwise",
                      "path": "src/main/foo",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                  ],
                  "group": "nathanwise",
                  "isDirectory": true,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": "foo",
                  "owner": "nathanwise",
                  "path": "src/main",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
                {
                  "blocks": 19,
                  "group": "nathanwise",
                  "isDirectory": false,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": ".testing",
                  "owner": "nathanwise",
                  "path": "src/main",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
                {
                  "blocks": 8,
                  "children": [],
                  "group": "nathanwise",
                  "isDirectory": true,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": ".empty",
                  "owner": "nathanwise",
                  "path": "src/main",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
                {
                  "blocks": 8,
                  "children": [
                    {
                      "blocks": 0,
                      "children": [],
                      "group": "nathanwise",
                      "isDirectory": true,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "someEmptyDir",
                      "owner": "nathanwise",
                      "path": "src/main/.full",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 12,
                      "group": "nathanwise",
                      "isDirectory": false,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "aFile",
                      "owner": "nathanwise",
                      "path": "src/main/.full",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                  ],
                  "group": "nathanwise",
                  "isDirectory": true,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": ".full",
                  "owner": "nathanwise",
                  "path": "src/main",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
              ],
              "group": "nathanwise",
              "isDirectory": true,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "main",
              "owner": "nathanwise",
              "path": "src",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
            {
              "blocks": 52,
              "group": "nathanwise",
              "isDirectory": false,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "index.ts",
              "owner": "nathanwise",
              "path": "src",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
          ],
          "group": "nathanwise",
          "isDirectory": true,
          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
          "name": "src",
          "owner": "nathanwise",
          "path": "",
          "permissions": [
            6,
            6,
            4,
          ],
          "size": 0,
        }
      `);
    });

    test("returns node for a valid single directory with no children", () => {
      // Arrange
      const path = ["test"];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toMatchInlineSnapshot(`
        {
          "blocks": 8,
          "children": [],
          "group": "nathanwise",
          "isDirectory": true,
          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
          "name": "test",
          "owner": "nathanwise",
          "path": "",
          "permissions": [
            6,
            6,
            4,
          ],
          "size": 0,
        }
      `);
    });

    test("returns root node for an empty path", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.walkFileTree(path);

      // Assert
      expect(result).not.toBeNull();

      result!.lastModifiedTime = new Date(2000, 0); // this value is unpredictable, even for snapshots
      expect(result).toMatchInlineSnapshot(`
        {
          "blocks": 0,
          "children": [
            {
              "blocks": 8,
              "children": [
                {
                  "blocks": 8,
                  "children": [
                    {
                      "blocks": 8,
                      "children": [
                        {
                          "blocks": 8,
                          "children": [],
                          "group": "nathanwise",
                          "isDirectory": true,
                          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                          "name": "bar",
                          "owner": "nathanwise",
                          "path": "src/main/foo",
                          "permissions": [
                            6,
                            6,
                            4,
                          ],
                          "size": 0,
                        },
                        {
                          "blocks": 12,
                          "group": "nathanwise",
                          "isDirectory": false,
                          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                          "name": "daz",
                          "owner": "nathanwise",
                          "path": "src/main/foo",
                          "permissions": [
                            6,
                            6,
                            4,
                          ],
                          "size": 0,
                        },
                        {
                          "blocks": 23,
                          "group": "nathanwise",
                          "isDirectory": false,
                          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                          "name": "bazzing.gaz",
                          "owner": "nathanwise",
                          "path": "src/main/foo",
                          "permissions": [
                            6,
                            6,
                            4,
                          ],
                          "size": 0,
                        },
                      ],
                      "group": "nathanwise",
                      "isDirectory": true,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": "foo",
                      "owner": "nathanwise",
                      "path": "src/main",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 19,
                      "group": "nathanwise",
                      "isDirectory": false,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": ".testing",
                      "owner": "nathanwise",
                      "path": "src/main",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 8,
                      "children": [],
                      "group": "nathanwise",
                      "isDirectory": true,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": ".empty",
                      "owner": "nathanwise",
                      "path": "src/main",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                    {
                      "blocks": 8,
                      "children": [
                        {
                          "blocks": 0,
                          "children": [],
                          "group": "nathanwise",
                          "isDirectory": true,
                          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                          "name": "someEmptyDir",
                          "owner": "nathanwise",
                          "path": "src/main/.full",
                          "permissions": [
                            6,
                            6,
                            4,
                          ],
                          "size": 0,
                        },
                        {
                          "blocks": 12,
                          "group": "nathanwise",
                          "isDirectory": false,
                          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                          "name": "aFile",
                          "owner": "nathanwise",
                          "path": "src/main/.full",
                          "permissions": [
                            6,
                            6,
                            4,
                          ],
                          "size": 0,
                        },
                      ],
                      "group": "nathanwise",
                      "isDirectory": true,
                      "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                      "name": ".full",
                      "owner": "nathanwise",
                      "path": "src/main",
                      "permissions": [
                        6,
                        6,
                        4,
                      ],
                      "size": 0,
                    },
                  ],
                  "group": "nathanwise",
                  "isDirectory": true,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": "main",
                  "owner": "nathanwise",
                  "path": "src",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
                {
                  "blocks": 52,
                  "group": "nathanwise",
                  "isDirectory": false,
                  "lastModifiedTime": 2000-01-01T00:00:00.000Z,
                  "name": "index.ts",
                  "owner": "nathanwise",
                  "path": "src",
                  "permissions": [
                    6,
                    6,
                    4,
                  ],
                  "size": 0,
                },
              ],
              "group": "nathanwise",
              "isDirectory": true,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "src",
              "owner": "nathanwise",
              "path": "",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
            {
              "blocks": 8,
              "children": [],
              "group": "nathanwise",
              "isDirectory": true,
              "lastModifiedTime": 2000-01-01T00:00:00.000Z,
              "name": "test",
              "owner": "nathanwise",
              "path": "",
              "permissions": [
                6,
                6,
                4,
              ],
              "size": 0,
            },
          ],
          "group": "",
          "isDirectory": true,
          "lastModifiedTime": 2000-01-01T00:00:00.000Z,
          "name": "",
          "owner": "",
          "path": "",
          "permissions": [],
          "size": 0,
        }
      `);
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

  describe("doesFileExist", () => {
    test("returns false for a directory path that exists", () => {
      // Arrange
      const path = ["src", "main", "foo"];

      // Act
      const result = FileSystemUtil.doesFileExist(path);

      // Assert
      expect(result).toBeFalsy();
    });

    test("returns true for a file path that exists", () => {
      // Arrange
      const path: string[] = ["src", "index.ts"];

      // Act
      const result = FileSystemUtil.doesFileExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns false for an empty path (root directory)", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.doesFileExist(path);

      // Assert
      expect(result).toBeFalsy();
    });

    test("returns false for a path that does not exist", () => {
      // Arrange
      const path = ["some", "fake", "path"];

      // Act
      const result = FileSystemUtil.doesFileExist(path);

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe("doesDirectoryExist", () => {
    test("returns true for a directory path that exists", () => {
      // Arrange
      const path = ["src", "main", "foo"];

      // Act
      const result = FileSystemUtil.doesDirectoryExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns false for a file path that exists", () => {
      // Arrange
      const path: string[] = ["src", "index.ts"];

      // Act
      const result = FileSystemUtil.doesDirectoryExist(path);

      // Assert
      expect(result).toBeFalsy();
    });

    test("returns true for an empty path (root directory)", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.doesDirectoryExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns false for a path that does not exist", () => {
      // Arrange
      const path = ["some", "fake", "path"];

      // Act
      const result = FileSystemUtil.doesDirectoryExist(path);

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe("doesFileOrDirectoryExist", () => {
    test("returns true for a directory path that exists", () => {
      // Arrange
      const path = ["src", "main", "foo"];

      // Act
      const result = FileSystemUtil.doesFileOrDirectoryExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns true for a file path that exists", () => {
      // Arrange
      const path: string[] = ["src", "index.ts"];

      // Act
      const result = FileSystemUtil.doesFileOrDirectoryExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns true for an empty path (root directory)", () => {
      // Arrange
      const path: string[] = [];

      // Act
      const result = FileSystemUtil.doesFileOrDirectoryExist(path);

      // Assert
      expect(result).toBeTruthy();
    });

    test("returns false for a path that does not exist", () => {
      // Arrange
      const path = ["some", "fake", "path"];

      // Act
      const result = FileSystemUtil.doesFileOrDirectoryExist(path);

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe("stripDots", () => {
    test("returns the same path when given a path without dots", () => {
      // Arrange
      const path = "/some/example/path";

      // Act
      const result = FileSystemUtil.stripDots(path);

      // Assert
      expect(result).toEqual(path);
    });

    [
      "/some/example/path",
      "some/example/path",
      "some/example/path/",
      "/some/example/path/",
    ].forEach((path) => {
      test(`returns a path with the same starting & ending path separators when given '${path}'`, () => {
        // Act
        const result = FileSystemUtil.stripDots(path);

        // Assert
        expect(result).toEqual(path);
      });
    });

    test("returns a path with all dots removed", () => {
      // Arrange
      const path =
        "/some/.example/..path/with.multiple/dots./in.various/.places/";

      // Act
      const result = FileSystemUtil.stripDots(path);

      // Assert
      const expected = "/some/example/path/withmultiple/dots/invarious/places/";
      expect(result).toEqual(expected);
    });
  });

  describe("isDotEntry", () => {
    test("returns false for a filename that is not a dot entry", () => {
      // Arrange
      const filename = "someFile.txt";

      // Act
      const result = FileSystemUtil.isDotEntry(filename);

      // Assert
      expect(result).toBeFalsy();
    });

    test("returns false for an empty filename", () => {
      // Arrange
      const filename = "";

      // Act
      const result = FileSystemUtil.isDotEntry(filename);

      // Assert
      expect(result).toBeFalsy();
    });

    test("returns true for a filename that is a dot entry", () => {
      // Arrange
      const filename = ".anExample.txt";

      // Act
      const result = FileSystemUtil.isDotEntry(filename);

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe("getExtension", () => {
    [
      {
        type: "returns the extension for an normal file",
        filename: "foo.txt",
        expected: "txt",
      },
      {
        type: "returns nothing for an empty string",
        filename: "",
        expected: "",
      },
      {
        type: "returns nothing for file ending with a dot",
        filename: "test.",
        expected: "",
      },
      {
        type: "returns nothing for file ending without a dot",
        filename: "test",
        expected: "",
      },
      {
        type: "returns the extension for file with multiple dots",
        filename: "test.ing.txt",
        expected: "txt",
      },
    ].forEach(({ type, filename, expected }) => {
      test(type, () => {
        // Act
        const extension = FileSystemUtil.getExtension(filename);

        // Assert
        expect(extension).toEqual(expected);
      });
    });
  });

  describe("isExecutable", () => {
    [
      [1, 0, 0],
      [7, 7, 7],
      [2, 3, 2],
      [4, 4, 5],
      [1, 1, 1],
      [3, 4, 4],
      [6, 6, 5],
    ].forEach((permissions) => {
      test("returns true when at least one executable bit is present", () => {
        // Act
        const result = FileSystemUtil.isExecutable(permissions);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    [
      [0, 0, 0],
      [2, 4, 4],
      [0, 6, 0],
      [4, 4, 0],
      [6, 6, 6],
      [0, 2, 2],
    ].forEach((permissions) => {
      test("returns false when no executable bits are present", () => {
        // Act
        const result = FileSystemUtil.isExecutable(permissions);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("isArchiveFile", () => {
    ["some.zip", "archive.tar", "example.txt.7z"].forEach((filename) => {
      test("returns true when given a file with an archive extension", () => {
        // Act
        const result = FileSystemUtil.isArchiveFile(filename);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    ["empty", "example.txt", "foo.mp3"].forEach((filename) => {
      test("returns false when given a file without an archive extension", () => {
        // Act
        const result = FileSystemUtil.isArchiveFile(filename);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("isGraphicsFile", () => {
    ["some.png", "archive.jpeg", "example.txt.mp4"].forEach((filename) => {
      test("returns true when given a file with an archive extension", () => {
        // Act
        const result = FileSystemUtil.isGraphicsFile(filename);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    ["empty", "example.txt", "foo.mp3"].forEach((filename) => {
      test("returns false when given a file without an archive extension", () => {
        // Act
        const result = FileSystemUtil.isGraphicsFile(filename);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("isAudioFile", () => {
    ["some.midi", "archive.mp3", "example.txt.ogg"].forEach((filename) => {
      test("returns true when given a file with an archive extension", () => {
        // Act
        const result = FileSystemUtil.isAudioFile(filename);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    ["empty", "example.txt", "foo.mp4"].forEach((filename) => {
      test("returns false when given a file without an archive extension", () => {
        // Act
        const result = FileSystemUtil.isAudioFile(filename);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("isRubbishFile", () => {
    ["some.old", "archive.tmp", "example.txt.dpkg-new"].forEach((filename) => {
      test("returns true when given a file with an archive extension", () => {
        // Act
        const result = FileSystemUtil.isRubbishFile(filename);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    ["empty", "example.txt", "foo.mp4"].forEach((filename) => {
      test("returns false when given a file without an archive extension", () => {
        // Act
        const result = FileSystemUtil.isRubbishFile(filename);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("calculateBlockSize", () => {
    test("returns correct block size when provided with a new block size and current block size", () => {
      // Arrange
      const blocks = 500;
      const from = 1024;
      const to = 2056;

      // Act
      const result = FileSystemUtil.calculateBlocks(blocks, from, to);

      // Assert
      expect(result).toEqual(250);
    });

    test("returns the same block size when provided with an equivalent new block size and current block size", () => {
      // Arrange
      const blocks = 123;
      const from = 1024;
      const to = 1024;

      // Act
      const result = FileSystemUtil.calculateBlocks(blocks, from, to);

      // Assert
      expect(result).toEqual(blocks);
    });
  });

  describe("calculateHardLinks", () => {
    const testCases: {
      type: string;
      expected: number;
      node: FileTreeNode;
    }[] = [
      {
        type: "file",
        node: {
          isDirectory: false,
          name: "",
          path: "",
          lastModifiedTime: new Date(),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        expected: 1,
      },
      {
        type: "directory with no children",
        node: {
          isDirectory: true,
          children: [],
          name: "",
          path: "",
          lastModifiedTime: new Date(),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        expected: 2,
      },
      {
        type: "directory with only file children",
        node: {
          isDirectory: true,
          children: [
            {
              isDirectory: false,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
            {
              isDirectory: false,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
          ],
          name: "",
          path: "",
          lastModifiedTime: new Date(),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        expected: 2,
      },
      {
        type: "directory with only directory children",
        node: {
          isDirectory: true,
          children: [
            {
              isDirectory: true,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
            {
              isDirectory: true,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
          ],
          name: "",
          path: "",
          lastModifiedTime: new Date(),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        expected: 4,
      },
      {
        type: "directory with file & directory children",
        node: {
          isDirectory: true,
          children: [
            {
              isDirectory: true,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
            {
              isDirectory: false,
              name: "",
              path: "",
              lastModifiedTime: new Date(),
              size: 0,
              permissions: [],
              owner: "",
              group: "",
              blocks: 0,
            },
          ],
          name: "",
          path: "",
          lastModifiedTime: new Date(),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        expected: 3,
      },
    ];

    testCases.forEach(({ type, node, expected }) => {
      test(`returns ${expected} for ${type}`, () => {
        // Act
        const result = FileSystemUtil.calculateHardLinks(node);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe("getHumanReadableSize", () => {
    [0, 1, 200, 1000, 1023, 1024].forEach((bytes) => {
      test("returns 1K for bytes <= 1KB", () => {
        // Act
        const result = FileSystemUtil.getHumanReadableSize(bytes);

        // Assert
        expect(result).toEqual("1K");
      });
    });

    [5121, 5300, 6143].forEach((bytes) => {
      test("returns 6K for 5KB < bytes <= 6KB", () => {
        // Act
        const result = FileSystemUtil.getHumanReadableSize(bytes);

        // Assert
        expect(result).toEqual("6K");
      });
    });

    [2097153, 3000000, 3145728].forEach((bytes) => {
      test("returns 3M for 2MB < bytes <= 3MB", () => {
        // Act
        const result = FileSystemUtil.getHumanReadableSize(bytes);

        // Assert
        expect(result).toEqual("3M");
      });
    });

    test("returns 6GB for exactly 6GB", () => {
      // Arrange
      const bytes = 6442450944;

      // Act
      const result = FileSystemUtil.getHumanReadableSize(bytes);

      // Assert
      expect(result).toEqual("6G");
    });

    [6442450945, 6700000000, 7516192768].forEach((bytes) => {
      test("returns 7B for 6GB < bytes <= 7GB", () => {
        // Act
        const result = FileSystemUtil.getHumanReadableSize(bytes);

        // Assert
        expect(result).toEqual("7G");
      });
    });

    test("returns 5120G for 5TB worth of bytes", () => {
      // Arrange
      const bytes = 5497558138880;

      // Act
      const result = FileSystemUtil.getHumanReadableSize(bytes);

      // Assert
      expect(result).toEqual("5120G");
    });
  });

  describe("getHumanReadablePermissions", () => {
    [
      {
        permissions: [0, 0, 0],
        isDirectory: false,
        expected: "----------",
      },
      {
        permissions: [0, 0, 0],
        isDirectory: true,
        expected: "d---------",
      },
      {
        permissions: [1, 2, 3],
        isDirectory: false,
        expected: "---x-w--wx",
      },
      {
        permissions: [4, 5, 6],
        isDirectory: true,
        expected: "dr--r-xrw-",
      },
      {
        permissions: [7, 7, 7],
        isDirectory: false,
        expected: "-rwxrwxrwx",
      },
    ].forEach(({ permissions, isDirectory, expected }) => {
      test(`returns ${expected} for permissions='${permissions}' and isDirectory=${isDirectory}`, () => {
        // Act
        const result = FileSystemUtil.getHumanReadablePermissions(
          permissions,
          isDirectory,
        );

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe("sortNodes", () => {
    test("returns no nodes when no nodes are provided", () => {
      // Arrange
      const nodes: FileTreeNode[] = [];

      // Act
      const result = FileSystemUtil.sortNodes(nodes);

      // Assert
      expect(result).toEqual([]);
    });

    test("returns alphabetically sorted nodes when nodes without '.' in their names/paths are provided", () => {
      // Arrange
      const nodes: FileTreeNode[] = [
        {
          name: "zFile",
          path: "/a/path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        {
          name: "aFile",
          path: "/z/path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        {
          name: "someFile",
          path: "/",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
      ];

      // Act
      const result = FileSystemUtil.sortNodes(nodes);

      // Assert
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "zFile",
            "owner": "",
            "path": "/a/path",
            "permissions": [],
            "size": 0,
          },
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "someFile",
            "owner": "",
            "path": "/",
            "permissions": [],
            "size": 0,
          },
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "aFile",
            "owner": "",
            "path": "/z/path",
            "permissions": [],
            "size": 0,
          },
        ]
      `);
    });

    test("returns alphabetically sorted nodes when nodes with various '.' in their names/paths are provided", () => {
      // Arrange
      const nodes: FileTreeNode[] = [
        {
          name: ".zFile.txt",
          path: "/a/path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        {
          name: ".zFile.a",
          path: "/a/path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        {
          name: "zFile.a",
          path: "/a/path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
        {
          name: ".zFile",
          path: "/.a//path",
          isDirectory: false,
          lastModifiedTime: new Date(2020, 0),
          size: 0,
          permissions: [],
          owner: "",
          group: "",
          blocks: 0,
        },
      ];

      // Act
      const result = FileSystemUtil.sortNodes(nodes);

      // Assert
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": ".zFile",
            "owner": "",
            "path": "/.a//path",
            "permissions": [],
            "size": 0,
          },
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": ".zFile.a",
            "owner": "",
            "path": "/a/path",
            "permissions": [],
            "size": 0,
          },
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "zFile.a",
            "owner": "",
            "path": "/a/path",
            "permissions": [],
            "size": 0,
          },
          {
            "blocks": 0,
            "group": "",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": ".zFile.txt",
            "owner": "",
            "path": "/a/path",
            "permissions": [],
            "size": 0,
          },
        ]
      `);
    });
  });
});
