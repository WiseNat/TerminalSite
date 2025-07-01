import { describe, expect, test } from "vitest";
import getCommandScripts from "../../../src/util/meta_import_util";

describe("Meta Import Util", () => {
  describe("getCommandScripts", () => {
    test("should return non-empty object of all files when script files exist", () => {
      // Arrange & Act
      const commandScripts = getCommandScripts();

      // Assert
      expect(commandScripts).toBeDefined();
      expect(commandScripts).not.toEqual({});
    });
  });
});
