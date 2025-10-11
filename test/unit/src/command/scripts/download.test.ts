import { beforeEach, describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import DOWNLOAD from "../../../../../src/command/scripts/download.ts";
import FileImportUtil from "../../../../../src/util/file_import_util.ts";

describe("Download", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/file_import_util");

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe("run", () => {
    test("should output nothing when no args are passed", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await DOWNLOAD.run(args);

      // Assert
      expect(appendOutput).not.toHaveBeenCalled();
    });

    [
      ["/src/main", "/test"],
      ["a", "b", "c"],
    ].forEach((args: string[]) => {
      test(`should output an error message when multiple args are passed: ${args}`, async () => {
        // Act
        await DOWNLOAD.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "download: Too many paths",
        );
      });
    });

    test("should output an error message when an unknown path is passed", async () => {
      // Arrange
      const args: string[] = ["/some/fake/path"];
      vi.mocked(FileImportUtil.getFileUrl).mockReturnValue(null);

      // Act
      await DOWNLOAD.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `download: ${args[0]}: No such file or directory`,
      );
    });

    test("should output an error message when a Directory path is passed", async () => {
      // Arrange
      const args: string[] = ["/src/main"];
      vi.mocked(FileImportUtil.getFileUrl).mockReturnValue(null);

      // Act
      await DOWNLOAD.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        `download: ${args[0]}: Is a directory`,
      );
    });

    test("should download a file when a File path is passed", async () => {
      // Arrange
      const args: string[] = ["/src/index.ts"];
      vi.mocked(FileImportUtil.getFileUrl).mockReturnValue("someUrl");

      vi.stubGlobal(
        "fetch",
        vi.fn(() => {
          return new Response("example body data", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }),
      );

      vi.stubGlobal("document", {
        createElement: vi.fn(() => {
          return {
            href: "",
            download: "",
            click: vi.fn(),
          };
        }),
      });

      // Act
      await DOWNLOAD.run(args);

      // Assert
      expect(appendOutput).not.toHaveBeenCalled();
    });
  });
});
