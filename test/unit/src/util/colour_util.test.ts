import { describe, expect, test } from "vitest";
import ColourUtil from "../../../../src/util/colour_util";
import { FileTreeNode } from "virtual:file-tree";
import {
  BLUE,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
} from "../../../../src/constant/colour";

/**
 * Creates a minimal node with modifications to the fields that matter for `getFileSystemEntryStyle`
 */
function createNode(
  name: string,
  isDirectory: boolean,
  permissions: number[],
  path?: string,
): FileTreeNode {
  return {
    blocks: 0,
    name: name,
    path: path === undefined ? "" : path,
    isDirectory: isDirectory,
    children: [],
    lastModifiedTime: new Date(),
    size: 0,
    permissions: permissions,
    owner: "",
    group: "",
  };
}

describe("ColourUtil", () => {
  describe("getFileSystemEntry", () => {
    [
      {
        type: "returns a short name when given a txt file node and useShortName=true",
        node: createNode("file.txt", false, [6, 6, 4], "some/path"),
        useShortName: true,
        expected: "file.txt",
      },
      {
        type: "returns a long name when given a txt file node and useShortName=false",
        node: createNode("file.txt", false, [6, 6, 4], "some/path"),
        useShortName: false,
        expected: "/some/path/file.txt",
      },
      {
        type: "returns a span with colour and a short name when given an executable file node and useShortName=true",
        node: createNode("file.txt", false, [7, 7, 7], "some/path"),
        useShortName: true,
        expected: `<span style='color: ${GREEN}; font-weight: bold'>file.txt</span>`,
      },
      {
        type: "returns a span with colour and a long name when given an executable file node and useShortName=false",
        node: createNode("file.txt", false, [7, 7, 7], "some/path"),
        useShortName: false,
        expected: `<span style='color: ${GREEN}; font-weight: bold'>/some/path/file.txt</span>`,
      },
    ].forEach(({ type, node, useShortName, expected }) => {
      test(type, () => {
        // Act
        const result = ColourUtil.getFileSystemEntry(node, useShortName);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe("getFileSystemEntryStyle", () => {
    test("normal file should have no styling", () => {
      // Arrange
      const node = createNode("example.txt", false, [6, 6, 4]);

      // Act
      const result = ColourUtil.getFileSystemEntryStyle(node);

      // Assert
      expect(result).not.toBeNull();
      expect(result.foreground).toBeNull();
      expect(result.background).toBeNull();
      expect(result.fontWeight).toBeNull();
    });

    [
      {
        name: "var",
        permissions: [6, 6, 4],
      },
      {
        name: "archive.tar",
        permissions: [6, 6, 4],
      },
      {
        name: "tmp",
        permissions: [7, 7, 7],
      },
    ].forEach(({ name, permissions }) => {
      test(`directory (${name}, ${permissions}) should have Bold Blue Text`, () => {
        // Arrange
        const node = createNode(name, true, permissions);

        // Act
        const result = ColourUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(BLUE);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });

    [
      {
        name: "example.txt",
        permissions: [1, 0, 0],
      },
      {
        name: "some.zip",
        permissions: [7, 0, 0],
      },
      {
        name: "example.png",
        permissions: [0, 1, 0],
      },
      {
        name: "foo.mp3",
        permissions: [0, 0, 1],
      },
    ].forEach(({ name, permissions }) => {
      test(`directory (${name}, ${permissions}) should have Bold Blue Text`, () => {
        // Arrange
        const node = createNode(name, false, permissions);

        // Act
        const result = ColourUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(GREEN);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });

    [
      {
        name: "some.zip",
      },
      {
        name: "archive.tar",
      },
    ].forEach(({ name }) => {
      test(`archive file (${name}) should have Bold Red Text`, () => {
        // Arrange
        const node = createNode(name, false, [6, 6, 4]);

        // Act
        const result = ColourUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(RED);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });

    [
      {
        name: "some.png",
      },
      {
        name: "archive.tar.jpeg",
      },
      {
        name: "another.gif",
      },
    ].forEach(({ name }) => {
      test(`graphics file (${name}) should have Bold Magenta Text`, () => {
        // Arrange
        const node = createNode(name, false, [6, 6, 4]);

        // Act
        const result = ColourUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(MAGENTA);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });

    [
      {
        name: "some.mp3",
      },
      {
        name: "archive.tar.ogg",
      },
    ].forEach(({ name }) => {
      test(`audio file (${name}) should have Bold Cyan Text`, () => {
        // Arrange
        const node = createNode(name, false, [6, 6, 4]);

        // Act
        const result = ColourUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(CYAN);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });
  });
});
