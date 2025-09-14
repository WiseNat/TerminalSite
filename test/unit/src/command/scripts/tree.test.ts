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

    describe("No flags", () => {
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

      test("given a directory path to a complex directory, should output a tree for the directory", async () => {
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

    describe("-a flag", () => {
      test("given a directory path with the -a flag, should output a tree for the directory including dotfiles", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "-a"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "├── src\n" +
          "│   ├── index.ts\n" +
          "│   └── main\n" +
          "│       ├── .empty\n" +
          "│       ├── foo\n" +
          "│       │   ├── bar\n" +
          "│       │   ├── bazzing.gaz\n" +
          "│       │   └── daz\n" +
          "│       ├── .full\n" +
          "│       │   ├── aFile\n" +
          "│       │   └── someEmptyDir\n" +
          "│       └── .testing\n" +
          "└── test\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "9 directories, 6 files";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });

    describe("-d flag", () => {
      test("given a directory path with the -d flag, should output a tree for the directory skipping all files", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "-d"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "├── src\n" +
          "│   └── main\n" +
          "│       └── foo\n" +
          "│           └── bar\n" +
          "└── test\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "6 directories";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });

      test("given a directory path with the -d & -a flags, should output a tree for the directory skipping all files but including dot-dirs", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "-ad"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "├── src\n" +
          "│   └── main\n" +
          "│       ├── .empty\n" +
          "│       ├── foo\n" +
          "│       │   └── bar\n" +
          "│       └── .full\n" +
          "│           └── someEmptyDir\n" +
          "└── test\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "9 directories";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });

    describe("--prune flag", () => {
      test("given a directory path with the --prune flag, should output a tree for the directory excluding empty directories", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "--prune"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "└── src\n" +
          "    ├── index.ts\n" +
          "    └── main\n" +
          "        └── foo\n" +
          "            ├── bazzing.gaz\n" +
          "            └── daz\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "4 directories, 4 files";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });

      test("given a directory path with the --prune & -a flags, should output a tree for the directory excluding empty directories but including hidden files & directories", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "--prune", "-a"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "└── src\n" +
          "    ├── index.ts\n" +
          "    └── main\n" +
          "        ├── foo\n" +
          "        │   ├── bazzing.gaz\n" +
          "        │   └── daz\n" +
          "        ├── .full\n" +
          "        │   └── aFile\n" +
          "        └── .testing\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "5 directories, 6 files";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });

    describe("-f flag", () => {
      test("given a directory path with the -f flag, should output a tree for the directory with full path names for each directory & file", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "-f"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "├── /src\n" +
          "│   ├── /src/index.ts\n" +
          "│   └── /src/main\n" +
          "│       └── /src/main/foo\n" +
          "│           ├── /src/main/foo/bar\n" +
          "│           ├── /src/main/foo/bazzing.gaz\n" +
          "│           └── /src/main/foo/daz\n" +
          "└── /test\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "6 directories, 4 files";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });

      test("given a directory path with the -f & -a flags, should output a tree for the directory including hidden files & dirs with full path names for each directory & file", async () => {
        // Arrange
        const args = ["../..", "foo/daz", "/some/fake/path", "-fa"];

        // Act
        await tree.run(args);

        // Assert
        const expected =
          "\n/\n" +
          "├── /src\n" +
          "│   ├── /src/index.ts\n" +
          "│   └── /src/main\n" +
          "│       ├── /src/main/.empty\n" +
          "│       ├── /src/main/foo\n" +
          "│       │   ├── /src/main/foo/bar\n" +
          "│       │   ├── /src/main/foo/bazzing.gaz\n" +
          "│       │   └── /src/main/foo/daz\n" +
          "│       ├── /src/main/.full\n" +
          "│       │   ├── /src/main/.full/aFile\n" +
          "│       │   └── /src/main/.full/someEmptyDir\n" +
          "│       └── /src/main/.testing\n" +
          "└── /test\n" +
          "/src/main/foo/daz  [error opening dir]\n" +
          "/some/fake/path  [error opening dir]\n" +
          "\n" +
          "9 directories, 6 files";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });
  });
});
