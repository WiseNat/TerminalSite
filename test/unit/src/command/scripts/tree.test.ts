import { beforeEach, describe, expect, test, vi } from "vitest";
import tree from "../../../../../src/command/scripts/tree.ts";
import FileSystemUtil from "../../../../../src/util/file_system_util.ts";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import ColourUtil from "../../../../../src/util/colour_util.ts";

describe("Tree", () => {
  beforeEach(() => {
    FileSystemUtil.setCurrentWorkingDirectory("/src/main");
  });

  describe("run", () => {
    // Spy
    const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");
    vi.mock("../../../../../src/util/colour_util");

    vi.mocked(ColourUtil.getFileSystemEntry).mockImplementation(
      (node, useShortName) => {
        if (useShortName) {
          return node.name;
        }

        return node.path === ""
          ? `/${node.name}`
          : `/${node.path}/${node.name}`;
      },
    );

    test("given no path, should output a tree for the current working directory", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/src/main\n" +
        "└── foo\n" +
        "    ├── bar\n" +
        "    ├── bazzing.gaz\n" +
        "    └── daz\n" +
        "\n" +
        "3 directories, 2 files";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given a file path, should output an error", async () => {
      // Arrange
      const args: string[] = ["foo/daz"];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/src/main/foo/daz  [error opening dir]\n" +
        "\n" +
        "0 directories, 1 file";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given an unknown path, should output an error", async () => {
      // Arrange
      const args: string[] = ["/some/fake/path"];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/some/fake/path  [error opening dir]\n" +
        "\n" +
        "0 directories, 0 files";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given a directory path, should output a tree for the directory", async () => {
      // Arrange
      const args: string[] = ["./foo"];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/src/main/foo\n" +
        "├── bar\n" +
        "├── bazzing.gaz\n" +
        "└── daz\n" +
        "\n" +
        "2 directories, 2 files";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given a directory path to an empty directory, should output an empty tree for the directory", async () => {
      // Arrange
      const args: string[] = ["../../test"];

      // Act
      await tree.run(args);

      // Assert
      const expected = "\n/test\n" + "\n" + "0 directories, 0 files";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given a directory path to a hidden directory, should output an tree for the directory", async () => {
      // Arrange
      const args: string[] = [".full"];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/src/main/.full\n" +
        "├── aFile\n" +
        "└── someEmptyDir\n" +
        "\n" +
        "2 directories, 1 file";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    test("given a directory path to a complex directory, should output an tree for the directory", async () => {
      // Arrange
      const args: string[] = ["../.."];

      // Act
      await tree.run(args);

      // Assert
      const expected =
        "\n/\n" +
        "├── src\n" +
        "│   ├── index.ts\n" +
        "│   └── main\n" +
        "│       └── foo\n" +
        "│           ├── bar\n" +
        "│           ├── bazzing.gaz\n" +
        "│           └── daz\n" +
        "└── test\n" +
        "\n" +
        "6 directories, 3 files";
      expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
    });

    [
      {
        type: "given multiple directory paths, should output trees for both",
        args: ["./foo", "./"],
        expected:
          "\n/src/main/foo\n" +
          "├── bar\n" +
          "├── bazzing.gaz\n" +
          "└── daz\n" +
          "/src/main\n" +
          "└── foo\n" +
          "    ├── bar\n" +
          "    ├── bazzing.gaz\n" +
          "    └── daz\n" +
          "\n" +
          "5 directories, 4 files",
      },
      {
        type: "given multiple file paths, should output errors for both",
        args: ["foo/daz", ".full/aFile"],
        expected:
          "\n/src/main/foo/daz  [error opening dir]\n" +
          "/src/main/.full/aFile  [error opening dir]\n" +
          "\n" +
          "0 directories, 2 files",
      },
      {
        type: "given a directory and file path, should output a tree and an error",
        args: ["foo", "foo/daz"],
        expected:
          "\n/src/main/foo\n" +
          "├── bar\n" +
          "├── bazzing.gaz\n" +
          "└── daz\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "\n" +
          "2 directories, 3 files",
      },
      {
        type: "given file and directory path, should output an error and a tree",
        args: ["foo/daz", "foo"],
        expected:
          "\n/src/main/foo/daz  [error opening dir]\n" +
          "/src/main/foo\n" +
          "├── bar\n" +
          "├── bazzing.gaz\n" +
          "└── daz\n" +
          "\n" +
          "2 directories, 3 files",
      },
    ].forEach(({ type, args, expected }) => {
      test(type, async () => {
        // Act
        await tree.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });
  });
});
