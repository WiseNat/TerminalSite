import { describe, expect, test } from "vitest";
import MetaImportUtil from "../../../../src/util/meta_import_util";

describe("MetaImportUtil", () => {
  describe("getCommandScripts", () => {
    test("should return non-empty object of all files when script files exist", () => {
      // Arrange & Act
      const commandScripts = MetaImportUtil.getCommandScripts();

      // Assert
      expect(commandScripts).toBeDefined();
      expect(commandScripts).not.toEqual({});
    });
  });

  describe("getKey", () => {
    test("should return a valid key for a command that exists", () => {
      // Arrange
      const command = "echo";

      // Act
      const key = MetaImportUtil.getKey(command);

      // Assert
      expect(key).toBeDefined();
      expect(MetaImportUtil.getCommandScripts()[key]).toBeDefined();
    });

    test("should return a valid key for a command that does not exist", () => {
      // Arrange
      const command = "somefakecommand";

      // Act
      const key = MetaImportUtil.getKey(command);

      // Assert
      expect(key).toBeDefined();
      expect(MetaImportUtil.getCommandScripts()[key]).not.toBeDefined();
    });
  });

  describe("removePathFromKey", () => {
    test("when given a path that starts with a path and ends with .ts, should return a valid key", () => {
      // Arrange
      const path = "./echo.ts";

      // Act
      const commandAgain = MetaImportUtil.removePathFromKey(path);

      // Assert
      expect(commandAgain).toEqual("echo");
    });

    test("when given a path that starts with a path, should return a valid key", () => {
      // Arrange
      const path = "./echo";

      // Act
      const commandAgain = MetaImportUtil.removePathFromKey(path);

      // Assert
      expect(commandAgain).toEqual("echo");
    });

    test("when given a path that ends with .ts, should return a valid key", () => {
      // Arrange
      const path = "echo.ts";

      // Act
      const commandAgain = MetaImportUtil.removePathFromKey(path);

      // Assert
      expect(commandAgain).toEqual("echo");
    });

    test("when given a path that starts and ends with nothing significant, should return the same key", () => {
      // Arrange
      const path = "echo";

      // Act
      const commandAgain = MetaImportUtil.removePathFromKey(path);

      // Assert
      expect(commandAgain).toEqual("echo");
    });
  });
});
