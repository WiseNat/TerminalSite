import { describe, expect, test } from "vitest";
import getCommandScripts from "../../../src/util/meta_import_util";

// TODO: Define this as an Integration Test

describe("Meta Import Util", () => {
  describe("getCommandScripts", () => {
    test("should return non-empty object of all files when script files exist", () => {
      const commandScripts = getCommandScripts();

      expect(commandScripts).toBeDefined();
      expect(commandScripts).not.toEqual({});
    });
  });
});
