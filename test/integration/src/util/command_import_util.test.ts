import { describe, expect, test } from "vitest";
import CommandImportUtil from "../../../../src/util/command_import_util.ts";

describe("MetaImportUtil", () => {
  describe("getCommandScripts", () => {
    test("should return non-empty object of all files when script files exist", () => {
      // Arrange & Act
      const commandScripts = CommandImportUtil.getCommandScripts();

      // Assert
      expect(commandScripts).toBeDefined();
      expect(commandScripts).not.toEqual({});
    });
  });
});
