import { describe, expect, test, vi } from "vitest";
import FALSE from "../../../../../../src/command/scripts/fake/false.ts";
import TRUE from "../../../../../../src/command/scripts/fake/true.ts";

describe("Commands that Output Nothing", async () => {
  // Mock
  const terminalUtil = await vi.importMock(
    "../../../../../../src/util/terminal_util",
  );

  [
    { command: "true", commandScript: TRUE },
    { command: "false", commandScript: FALSE },
  ].forEach(({ command, commandScript }) => {
    test(`${command} should do nothing`, async () => {
      // Arrange
      const args = ["foo", "-d", "--bar", "baz"];

      // Act
      await commandScript.run(args);

      // Assert
      Object.values(terminalUtil).forEach((exported) => {
        if (typeof exported === "function") {
          expect(exported).not.toHaveBeenCalled();
        }
      });
    });
  });
});
