import { describe, expect, test, vi } from "vitest";
import FormatterUtil from "../../../../src/util/formatter_util.ts";
import { FileTreeNode } from "virtual:file-tree";
import {
  BLUE,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
} from "../../../../src/constant/colour";
import CssUtil from "../../../../src/util/css_util.ts";
import HtmlUtil from "../../../../src/util/html_util.ts";
import { mockExtractVisibleText } from "../../helper/mocks.ts";

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

describe("FormatterUtil", () => {
  // Mock
  vi.mock("../../../../src/util/terminal_util");
  vi.mock("../../../../src/util/css_util");
  vi.mock("../../../../src/util/html_util");

  mockExtractVisibleText();

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
        const result = FormatterUtil.getFileSystemEntry(node, useShortName);

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
      const result = FormatterUtil.getFileSystemEntryStyle(node);

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
        const result = FormatterUtil.getFileSystemEntryStyle(node);

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
        const result = FormatterUtil.getFileSystemEntryStyle(node);

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
        const result = FormatterUtil.getFileSystemEntryStyle(node);

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
        const result = FormatterUtil.getFileSystemEntryStyle(node);

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
        const result = FormatterUtil.getFileSystemEntryStyle(node);

        // Assert
        expect(result).not.toBeNull();
        expect(result.foreground).toEqual(CYAN);
        expect(result.background).toBeNull();
        expect(result.fontWeight).toEqual("bold");
      });
    });
  });

  describe("toDynamicGrid", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vi.mocked(CssUtil.getStyle).mockReturnValue({ font: "" });

    test("one item should return the same value", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(50);
      const items: string[] = ["FOO"];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual("FOO");
    });

    test("no items should return nothing", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(50);
      const items: string[] = [];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual("");
    });

    test("multiple items are ordered into a grid in the correct order with the right positioning", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(7);
      const items: string[] = ["A", "B", "C", "D", "E", "F", "G"];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual("A  D  G\nB  E\nC  F");
    });

    test("multiple items where one item is long is ordered correctly into a grid with the right padding", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(16);
      const items: string[] = ["A", "B", "CCCCCCCCCC", "D", "E", "F", "G"];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual(
        "A           D  G\n" + "B           E\n" + "CCCCCCCCCC  F",
      );
    });

    test("multiple items that fit on a single row & multiple columns should be returned with padding", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(50);
      const items: string[] = ["A", "B", "C", "D", "E"];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual("A  B  C  D  E");
    });

    test("multiple items that fit on multiple rows & a single column should be returned without padding", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(1);
      const items: string[] = ["A", "B", "C", "D", "E"];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual("A\nB\nC\nD\nE");
    });

    [2.6, 3, 20, 30, 100].forEach((characterWidth) => {
      test("multiple items that do not fit in a single column are forced into a single column", () => {
        // Arrange
        vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(characterWidth);
        vi.mocked(CssUtil.getElementWidth).mockReturnValue(2.5);
        const items: string[] = ["A", "B", "C", "D", "E"];

        // Act
        const result = FormatterUtil.toDynamicGrid(items);

        // Assert
        expect(result).toEqual("A\nB\nC\nD\nE");
      });
    });

    test("multiple items with HTML rely on the visual value for calculating the grid", () => {
      // Arrange
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(8);
      const items: string[] = [
        "<span>A</span>",
        "<a href='https://example.org'>B</a>",
        "<ul>C</ul>",
        "<b>D</b>",
        "E",
      ];

      // Act
      const result = FormatterUtil.toDynamicGrid(items);

      // Assert
      expect(result).toEqual(
        "<span>A</span>  <ul>C</ul>  E" +
          "\n<a href='https://example.org'>B</a>  <b>D</b>",
      );
    });
  });

  describe("toStaticGrid", () => {
    vi.mocked(HtmlUtil.extractVisibleText).mockImplementation((html) => {
      // Does not work with all HTML, just a rough solution as JSDom does
      // not support innerText
      return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    });

    test("one item should return the same value", () => {
      // Arrange
      const columns: string[] = [
        "Example" +
          "\n<span style='color: red'>Data</span> with" +
          "\nA <span style='color: green'>METRIC TON</span> of..........." +
          "\nlines!!!",
      ];

      // Act
      const result = FormatterUtil.toStaticGrid(columns);

      // Assert
      expect(result).toEqual(columns[0]);
    });

    test("no items should return nothing", () => {
      // Arrange
      const columns: string[] = [];

      // Act
      const result = FormatterUtil.toStaticGrid(columns);

      // Assert
      expect(result).toEqual("");
    });

    [
      {
        type: "Multiple simplistic columns",
        columns: [
          "A\nAA\nAAA\nAAAA\nAAAAA",
          "B\nBB\nBBB\nBBBB\nBBBBB",
          "CCCCC\nCCCC\nCCC\nCC\nC",
        ],
        expected:
          "A       B       CCCCC" +
          "\nAA      BB      CCCC" +
          "\nAAA     BBB     CCC" +
          "\nAAAA    BBBB    CC" +
          "\nAAAAA   BBBBB   C",
      },
      {
        type: "Multiple HTML Columns",
        columns: [
          "Example" +
            "\n<span style='color: red'>Data</span> with" +
            "\nA <span style='color: green'>METRIC TON</span> of..........." +
            "\nlines!!!" +
            "\n\nBAZ",
          "\n" + "\nFOOOOO" + "\nbar" + "\n!!!" + "\n" + "\na",
        ],
        expected:
          "Example                      \n" +
          "<span style='color: red'>Data</span> with                    \n" +
          "A <span style='color: green'>METRIC TON</span> of...........   FOOOOO\n" +
          "lines!!!                     bar\n" +
          "                             !!!\n" +
          "BAZ                          \n" +
          "                             a",
        foo:
          "Example                      \n" +
          "Data with                    \n" +
          "A METRIC TON of...........   FOOOOO\n" +
          "lines!!!                     bar\n" +
          "                             !!!\n" +
          "BAZ                          \n" +
          "                             a",
      },
    ].forEach(({ type, columns, expected }) => {
      test(`${type} are ordered into columns in the correct order with the right positioning & padding`, () => {
        // Act
        const result = FormatterUtil.toStaticGrid(columns);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });
});
