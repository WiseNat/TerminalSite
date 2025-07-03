import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../src/util/command_util";

describe("Echo", () => {
  // Mock
  vi.mock("../../../../src/util/terminal_util");

  test("should run with CommandUtil", () => {
    // Arrange
    const commandName = "echo";

    // Act & Assert
    expect(() => CommandUtil.executeCommand(commandName)).not.toThrowError();
  });
});
