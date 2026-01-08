import { describe, expect, test } from "vitest";
import FlavourImportUtil from "../../../../src/util/flavour_import_util.ts";

describe("FlavourImportUtil", () => {
  describe("getFlavours", () => {
    test("should return non-empty object of all files when flavour files exist", () => {
      // Arrange & Act
      const flavours = FlavourImportUtil.getFlavours();

      // Assert
      expect(flavours).toBeDefined();
      expect(flavours).not.toEqual({});
    });
  });
});
