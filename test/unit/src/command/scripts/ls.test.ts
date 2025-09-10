import { beforeEach, describe, expect, test, vi } from "vitest";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import ls from "../../../../../src/command/scripts/ls";
import TerminalUtil from "../../../../../src/util/terminal_util";
import ColourUtil from "../../../../../src/util/colour_util";

describe("Ls", () => {
  beforeEach(() => {
    FileSystemUtil.setHomeDirectory("/src/main");
    FileSystemUtil.setCurrentWorkingDirectory("~");
  });

  describe("run", () => {
    // Spy
    const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");
    vi.mock("../../../../../src/util/colour_util");

    // Mocked
    vi.mocked(ColourUtil.getFileSystemEntryStyle).mockReturnValue({
      foreground: null,
      background: null,
      fontWeight: null,
    });

    describe("No flags", () => {
      test("Given no arguments, outputs the contents of the current working directory", async () => {
        // Arrange
        const args: string[] = [];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith("\nfoo");
      });

      test("Given a non-empty regular directory argument, outputs the contents of the directory", async () => {
        // Arrange
        const args: string[] = ["/src/main"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith("\nfoo");
      });

      test("Given an empty regular directory argument, outputs nothing", async () => {
        // Arrange
        const args: string[] = ["/test"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).not.toHaveBeenCalled();
      });

      test("Given a non-empty dot-directory argument, outputs the contents of the directory", async () => {
        // Arrange
        const args: string[] = ["/src/main/.full"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\naFile\tsomeEmptyDir",
        );
      });

      test("Given an empty dot-directory argument, outputs nothing", async () => {
        // Arrange
        const args: string[] = ["/src/main/.empty"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).not.toHaveBeenCalled();
      });

      test("Given a regular file argument, outputs the path of the file", async () => {
        // Arrange
        const args: string[] = ["/src/index.ts"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\n/src/index.ts",
        );
      });

      test("Given a dot-file argument, outputs the path of the file", async () => {
        // Arrange
        const args: string[] = ["/src/main/.testing"];

        // Act
        await ls.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\n/src/main/.testing",
        );
      });

      [
        {
          type: "a normal unknown path",
          args: ["/some/fake/path"],
          expected: "/some/fake/path",
        },
        {
          type: "an unknown path in the home directory",
          args: ["~/fake/path"],
          expected: "/src/main/fake/path",
        },
      ].forEach(({ type, args, expected }) => {
        test(`Given ${type}, outputs an error`, async () => {
          // Act
          await ls.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
            `\nls: cannot access '${expected}': No such file or directory`,
          );
        });
      });

      [
        {
          type: "single unknown path, single directory, single file path",
          args: ["/some/fake/path", "/src/main/foo", "/src/index.ts"],
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\n/src/index.ts" +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz",
        },
        {
          type: "multiple unknown paths, multiple directories, multiple file paths",
          args: [
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ],
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n/src/index.ts\t/src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz" +
            "\n\n/test:",
        },
        {
          type: "single unknown path, single directory",
          args: ["/some/fake/path", "/src/main/foo"],
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz",
        },
        {
          type: "single unknown path, single file path",
          args: ["/some/fake/path", "/src/index.ts"],
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\n/src/index.ts",
        },
        {
          type: "single directory, single file path",
          args: ["/src/main/foo", "/src/index.ts"],
          expected:
            "\n/src/index.ts" +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz",
        },
      ].forEach(({ type, args, expected }) => {
        test(`Given multiple arguments (${type}), outputs everything in a structured way`, async () => {
          // Act
          await ls.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });

      test("Given multiple file arguments, all file entries are outputted alphabetically", async () => {
        // Arrange
        const args: string[] = [
          "/src/main/foo/daz",
          "/src/main/foo/bazzing.gaz",
          "/src/main/.testing",
          "/src/index.ts",
          "/src/main/.full/aFile",
        ];

        // Act
        await ls.run(args);

        // Assert
        // foo/bazzing.gaz  foo/daz  .full/aFile  index.ts  .testing
        const expected =
          "\n/src/index.ts\t/src/main/foo/bazzing.gaz\t/src/main/foo/daz\t/src/main/.full/aFile\t/src/main/.testing";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });

      test("Given multiple directory arguments, all directory entries & inner file entries are outputted alphabetically and directory entries are prefixed with '${path}:'", async () => {
        // Arrange
        const args: string[] = [
          "/test",
          "/src",
          "/src/main/foo",
          "/src/main/.empty",
          "/src/main/.full",
        ];

        // Act
        await ls.run(args);

        // Assert
        const expected =
          "\n/src:" +
          "\nindex.ts\tmain" +
          "\n\n/src/main/.empty:" +
          "\n\n/src/main/foo:" +
          "\nbar\tbazzing.gaz\tdaz" +
          "\n\n/src/main/.full:" +
          "\naFile\tsomeEmptyDir" +
          "\n\n/test:";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });

      [
        {
          type: "unknown path",
          arg: "/some/fake/path",
          typeExpected:
            "ls: cannot access '/some/fake/path': No such file or directory",
        },
        {
          type: "file entry",
          arg: "/src/index.ts",
          typeExpected: "/src/index.ts",
        },
      ].forEach(({ type, arg, typeExpected }) => {
        test(`Given a directory & ${type} argument, directory entries are prefixed with '$\{path}:'`, async () => {
          // Arrange
          const args: string[] = ["/src/main/foo"];
          args.push(arg);

          // Act
          await ls.run(args);

          // Assert
          const expected =
            `\n${typeExpected}` +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz";
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });
    });

    ["-a", "--all"].forEach((flag) => {
      describe(`${flag} flag`, () => {
        test(`Given a directory argument with the ${flag} flag, outputs the entire of the directory including dot-files & dot-dirs`, async () => {
          // Arrange
          const args: string[] = [
            flag,
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          // Act
          await ls.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n/src/index.ts\t/src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\n.\t..\tbar\tbazzing.gaz\tdaz" +
            "\n\n/test:" +
            "\n.\t..";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });
    });

    describe("-1 flag", () => {
      test("Given a directory argument with the -1 flag, outputs the contents of the directory on individual lines", async () => {
        // Arrange
        const args: string[] = [
          "-1",
          "/some/fake/path",
          "/src/main/foo",
          "/src/index.ts",
          "/some/other/fake/path",
          "/test",
          "/src/main/.testing",
        ];
        // Act
        await ls.run(args);

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory" +
          "\nls: cannot access '/some/other/fake/path': No such file or directory" +
          "\n/src/index.ts" +
          "\n/src/main/.testing" +
          "\n\n/src/main/foo:" +
          "\nbar" +
          "\nbazzing.gaz" +
          "\ndaz" +
          "\n\n/test:";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
      });
    });

    ["-s", "--size"].forEach((flag) => {
      describe(`${flag} flag`, () => {
        test(`Given a directory argument with the ${flag} flag, outputs the contents of the directory with block sizes`, async () => {
          // Arrange
          const args: string[] = [
            flag,
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          // Act
          await ls.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26 /src/index.ts\t10 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22" +
            "\n 4 bar\t12 bazzing.gaz\t6 daz" +
            "\n\n/test:" +
            "\ntotal: 0";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });

        test(`Given a directory argument with the ${flag} flag and -a flag, outputs the contents of the directory with increased block sizes`, async () => {
          // Arrange
          const args: string[] = [
            flag,
            "-a",
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          // Act
          await ls.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26 /src/index.ts\t10 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 30" +
            "\n 4 .\t4 ..\t4 bar\t12 bazzing.gaz\t6 daz" +
            "\n\n/test:" +
            "\ntotal: 4" +
            "\n 4 .\t0 ..";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });
    });

    ["-h", "--human-readable"].forEach((flag) => {
      describe(`${flag} flag`, () => {
        test(`Given a directory argument with the ${flag} and -s flag, outputs human readable files sizes of files and directories`, async () => {
          // Arrange
          const args: string[] = [
            flag,
            "-s",
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          // Act
          await ls.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26K /src/index.ts\t10K /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22K" +
            "\n 4K bar\t12K bazzing.gaz\t6K daz" +
            "\n\n/test:" +
            "\ntotal: 1K";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        });

        // TODO: -l flag
      });
    });
  });
});
