import { describe, expect, test } from "vitest";
import ObjectUtil from "../../../../src/util/object_util.ts";

describe("ObjectUtil", () => {
  describe("removeKeyPrefix", () => {
    test("removes the prefix if it exists", () => {
      // Arrange
      const prefix = "ABC";
      const o = {
        ABCfoo: {},
        ABbar: {},
        Cbaz: {},
        ABCgazABC: {},
        ABdCaz: {},
      };

      // Act
      ObjectUtil.removeKeyPrefix(o, prefix);

      // Assert
      expect(o).toStrictEqual({
        foo: {},
        ABbar: {},
        Cbaz: {},
        gazABC: {},
        ABdCaz: {},
      });
    });

    test("does nothing for an empty prefix", () => {
      // Arrange
      const o = {
        ABCfoo: {},
        ABbar: {},
        Cbaz: {},
        ABCgazABC: {},
        ABdCaz: {},
      };

      // Act
      ObjectUtil.removeKeyPrefix(o, "");

      // Assert
      expect(o).toStrictEqual({
        ABCfoo: {},
        ABbar: {},
        Cbaz: {},
        ABCgazABC: {},
        ABdCaz: {},
      });
    });
  });

  describe("removeKeySuffix", () => {
    test("removes the suffix if it exists", () => {
      // Arrange
      const suffix = "ABC";
      const o = {
        fooABC: {},
        barAB: {},
        bazC: {},
        ABCgazABC: {},
        daAzBC: {},
      };

      // Act
      ObjectUtil.removeKeySuffix(o, suffix);

      // Assert
      expect(o).toStrictEqual({
        foo: {},
        barAB: {},
        bazC: {},
        ABCgaz: {},
        daAzBC: {},
      });
    });

    test("does nothing for an empty suffix", () => {
      // Arrange
      const o = {
        fooABC: {},
        barAB: {},
        bazC: {},
        ABCgazABC: {},
        daAzBC: {},
      };

      // Act
      ObjectUtil.removeKeySuffix(o, "");

      // Assert
      expect(o).toStrictEqual({
        fooABC: {},
        barAB: {},
        bazC: {},
        ABCgazABC: {},
        daAzBC: {},
      });
    });
  });

  describe("removeKeyAffix", () => {
    test("removes the prefix and suffix if they exist", () => {
      // Arrange
      const prefix = "ABC";
      const suffix = "XYZ";
      const o = {
        ABCfooXYZ: {},
        ABbarXY: {},
        CbazZ: {},
        XYZgazABC: {},
        AdBCaXzYZ: {},
      };

      // Act
      ObjectUtil.removeKeyAffix(o, prefix, suffix);

      // Assert
      expect(o).toStrictEqual({
        foo: {},
        ABbarXY: {},
        CbazZ: {},
        XYZgazABC: {},
        AdBCaXzYZ: {},
      });
    });

    test("does nothing for an empty prefix or suffix", () => {
      // Arrange
      const o = {
        ABCfooXYZ: {},
        ABbarXY: {},
        CbazZ: {},
        XYZgazABC: {},
        AdBCaXzYZ: {},
      };

      // Act
      ObjectUtil.removeKeyAffix(o, "", "");

      // Assert
      expect(o).toStrictEqual({
        ABCfooXYZ: {},
        ABbarXY: {},
        CbazZ: {},
        XYZgazABC: {},
        AdBCaXzYZ: {},
      });
    });
  });
});
