import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../../src/util/command_util";

describe("Pwd", () => {
  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  test("should run with CommandUtil", () => {
    // Arrange
    const commandName = "pwd";

    // Act & Assert
    expect(
      async () => await CommandUtil.executeCommand(commandName),
    ).not.toThrowError();
  });
});
