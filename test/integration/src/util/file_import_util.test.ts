import { beforeEach, describe, expect, test, vi } from "vitest";
import FileImportUtil from "../../../../src/util/file_import_util";
import path from "path";

describe("FileImportUtil", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe("readFile", () => {
    test("should return null if file does not exist", async () => {
      // Arrange
      const input = "./" + path.join("bin", "fake_file.txt");
      vi.stubGlobal(
        "fetch",
        vi.fn(() => {
          return new Response("", {
            status: 404,
          });
        }),
      );
      vi.stubGlobal("__CONTENT_DIRECTORY", "example");

      // Act
      const result = await FileImportUtil.readFile(input);

      // Assert
      expect(result).toBeNull();
    });

    test("should return content for an existing file", async () => {
      // Arrange
      // Keep this up to date with "an" existing file path
      const input = "./" + path.join("home", "nathanwise", "help.txt");
      vi.stubGlobal(
        "fetch",
        vi.fn(() => {
          return new Response("example body data", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }),
      );
      vi.stubGlobal("__CONTENT_DIRECTORY", "example");

      // Act
      const result = await FileImportUtil.readFile(input);

      // Assert
      expect(result).not.toBeNull();
    });
  });
});
