import { describe, expect, test, vi } from "vitest";
import REBOOT from "../../../../../src/command/scripts/reboot.ts";
import HtmlUtil from "../../../../../src/util/html_util.ts";

// Mocks
vi.mock("../../../../../src/util/html_util");

describe("Reboot", () => {
  // Spy
  const refreshPage = vi.spyOn(HtmlUtil, "refreshPage");

  describe("run", () => {
    test("should restart the webpage", async () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      await REBOOT.run(args);

      // Assert
      expect(refreshPage).toHaveBeenCalledOnce();
    });
  });
});
