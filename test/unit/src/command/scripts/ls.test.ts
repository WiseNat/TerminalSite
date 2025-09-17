import { beforeEach, describe, expect, test, vi } from "vitest";
import FileSystemUtil from "../../../../../src/util/file_system_util";
import LS from "../../../../../src/command/scripts/ls";
import TerminalUtil from "../../../../../src/util/terminal_util";
import ColourUtil from "../../../../../src/util/colour_util";

describe("Ls", () => {
  // Spy
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/colour_util");

  // Mocked
  vi.mocked(ColourUtil.getFileSystemEntryStyle).mockReturnValue({
    foreground: null,
    background: null,
    fontWeight: null,
  });

  vi.mocked(ColourUtil.getFileSystemEntry).mockImplementation(
    (node, useShortName) => {
      return useShortName ? node.name : "/" + node.path + "/" + node.name;
    },
  );

  beforeEach(() => {
    FileSystemUtil.setHomeDirectory("/src/main");
    FileSystemUtil.setCurrentWorkingDirectory("~");
  });

  describe("run", () => {
    describe("No flags", () => {
      test("Given no arguments, outputs the contents of the current working directory", async () => {
        // Arrange
        const args: string[] = [];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith("\nfoo");
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given a non-empty regular directory argument, outputs the contents of the directory", async () => {
        // Arrange
        const args: string[] = ["/src/main"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith("\nfoo");
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given an empty regular directory argument, outputs nothing", async () => {
        // Arrange
        const args: string[] = ["/test"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).not.toHaveBeenCalled();
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given a non-empty dot-directory argument, outputs the contents of the directory", async () => {
        // Arrange
        const args: string[] = ["/src/main/.full"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\naFile\tsomeEmptyDir",
        );
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given an empty dot-directory argument, outputs nothing", async () => {
        // Arrange
        const args: string[] = ["/src/main/.empty"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).not.toHaveBeenCalled();
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given a regular file argument, outputs the path of the file", async () => {
        // Arrange
        const args: string[] = ["/src/index.ts"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\n/src/index.ts",
        );
        expect(appendOutput).not.toHaveBeenCalled();
      });

      test("Given a dot-file argument, outputs the path of the file", async () => {
        // Arrange
        const args: string[] = ["/src/main/.testing"];

        // Act
        await LS.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
          "\n/src/main/.testing",
        );
        expect(appendOutput).not.toHaveBeenCalled();
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
          await LS.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(
            `\nls: cannot access '${expected}': No such file or directory`,
          );
          expect(appendOutput).not.toHaveBeenCalled();
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
            "\n/src/main/foo:" +
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
          await LS.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
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
        await LS.run(args);

        // Assert
        // foo/bazzing.gaz  foo/daz  .full/aFile  index.ts  .testing
        const expected =
          "\n/src/index.ts\t/src/main/foo/bazzing.gaz\t/src/main/foo/daz\t/src/main/.full/aFile\t/src/main/.testing";
        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        expect(appendOutput).not.toHaveBeenCalled();
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
        await LS.run(args);

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
        expect(appendOutput).not.toHaveBeenCalled();
      });

      [
        {
          type: "unknown path",
          arg: "/some/fake/path",
          typeExpected:
            "ls: cannot access '/some/fake/path': No such file or directory\n",
        },
        {
          type: "file entry",
          arg: "/src/index.ts",
          typeExpected: "/src/index.ts\n\n",
        },
      ].forEach(({ type, arg, typeExpected }) => {
        test(`Given a directory & ${type} argument, directory entries are prefixed with '${arg}:'`, async () => {
          // Arrange
          const args: string[] = ["/src/main/foo"];
          args.push(arg);

          // Act
          await LS.run(args);

          // Assert
          const expected =
            `\n${typeExpected}` + "/src/main/foo:" + "\nbar\tbazzing.gaz\tdaz";
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
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
          await LS.run(args);

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
          expect(appendOutput).not.toHaveBeenCalled();
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
        await LS.run(args);

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
        expect(appendOutput).not.toHaveBeenCalled();
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
          await LS.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26 /src/index.ts\t10 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22" +
            "\n4 bar\t12 bazzing.gaz\t6 daz" +
            "\n\n/test:" +
            "\ntotal: 0";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
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
          await LS.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26 /src/index.ts\t10 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 30" +
            "\n4 .\t4 ..\t4 bar\t12 bazzing.gaz\t6 daz" +
            "\n\n/test:" +
            "\ntotal: 4" +
            "\n4 .\t0 ..";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
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
          await LS.run(args);

          // Assert
          const expected =
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26K /src/index.ts\t10K /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22K" +
            "\n4K bar\t12K bazzing.gaz\t6K daz" +
            "\n\n/test:" +
            "\ntotal: 1K";

          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
        });

        // TODO: -l flag
      });
    });

    // TODO: -l flag for some of these
    describe("--block-size flag", () => {
      [
        {
          flags: ["-s"],
          blockSize: 1,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26624 /src/index.ts\t9728 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22016" +
            "\n4096 bar\t11776 bazzing.gaz\t6144 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          flags: ["-s"],
          blockSize: 512,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n52 /src/index.ts\t19 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 43" +
            "\n8 bar\t23 bazzing.gaz\t12 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          flags: ["-s"],
          blockSize: 2048,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n13 /src/index.ts\t5 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 11" +
            "\n2 bar\t6 bazzing.gaz\t3 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          flags: [],
          blockSize: 2048,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n/src/index.ts\t/src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\nbar\tbazzing.gaz\tdaz" +
            "\n\n/test:",
        },
      ].forEach(({ flags, blockSize, expected }) => {
        test(`Given a arguments with the --block-size=${blockSize} flag and ${flags}, outputs an altered block size of files`, async () => {
          // Arrange
          const args: string[] = [
            `--block-size=${blockSize}`,
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          args.push(...flags);

          // Act
          await LS.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
        });
      });

      [
        {
          blockSize: 1,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26624 /src/index.ts\t9728 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22016" +
            "\n4096 bar\t11776 bazzing.gaz\t6144 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          blockSize: 512,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n52 /src/index.ts\t19 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 43" +
            "\n8 bar\t23 bazzing.gaz\t12 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          blockSize: 1024,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n26 /src/index.ts\t10 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 22" +
            "\n4 bar\t12 bazzing.gaz\t6 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
        {
          blockSize: 2048,
          expected:
            "\nls: cannot access '/some/fake/path': No such file or directory" +
            "\nls: cannot access '/some/other/fake/path': No such file or directory" +
            "\n13 /src/index.ts\t5 /src/main/.testing" +
            "\n\n/src/main/foo:" +
            "\ntotal: 11" +
            "\n2 bar\t6 bazzing.gaz\t3 daz" +
            "\n\n/test:" +
            "\ntotal: 0",
        },
      ].forEach(({ blockSize, expected }) => {
        test(`Given arguments with --block-size=${blockSize} and -sh, overrides the human readable sizes`, async () => {
          // Arrange
          const args: string[] = [
            `--block-size=${blockSize}`,
            "-sh",
            "/some/fake/path",
            "/src/main/foo",
            "/src/index.ts",
            "/some/other/fake/path",
            "/test",
            "/src/main/.testing",
          ];

          // Act
          await LS.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
          expect(appendOutput).not.toHaveBeenCalled();
        });
      });

      [0, -1, -53, "foo", "a", "/", ".", "3.", "1.55", "7.145.3"].forEach(
        (blockSize) => {
          test(`Given arguments with --block-size=${blockSize}, an error is outputted`, async () => {
            // Arrange
            const args: string[] = [
              `--block-size=${blockSize}`,
              "/some/fake/path",
              "/src/main/foo",
              "/src/index.ts",
              "/some/other/fake/path",
              "/test",
              "/src/main/.testing",
            ];

            // Act
            await LS.run(args);

            // Assert
            const expected = `ls: invalid --block-size argument '${blockSize}'`;
            expect(appendRawOutput).not.toHaveBeenCalled();
            expect(appendOutput).toHaveBeenCalledExactlyOnceWith(expected);
          });
        },
      );
    });

    describe("-l flag", () => {
      test("Given varying args, should output information in the long file format", async () => {
        // Arrange
        const args: string[] = [
          "-l",
          "/some/fake/path",
          "/src/main/foo",
          "/src/index.ts",
          "/some/other/fake/path",
          "/test",
          "/src/main/.testing",
        ];

        // Act
        await LS.run(args);

        // Assert
        const expected =
          "\nls: cannot access '/some/fake/path': No such file or directory" +
          "\nls: cannot access '/some/other/fake/path': No such file or directory" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t0 Jan 1 00:00 /src/index.ts" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t0 Jan 1 00:00 /src/main/.testing" +
          "\n\n/src/main/foo:" +
          "\ntotal: 22" +
          "\ndrw-rw-r-- 2 nathanwise nathanwise\t0 Jan 1 00:00 bar" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t0 Jan 1 00:00 bazzing.gaz" +
          "\n-rw-rw-r-- 1 nathanwise nathanwise\t0 Jan 1 00:00 daz" +
          "\n\n/test:" +
          "\ntotal: 0";

        expect(appendRawOutput).toHaveBeenCalledExactlyOnceWith(expected);
        expect(appendOutput).not.toHaveBeenCalled();
      });
    });
  });
});
