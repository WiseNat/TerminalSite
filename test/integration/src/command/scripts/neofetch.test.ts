import { describe, expect, test, vi } from "vitest";
import CommandUtil from "../../../../../src/util/command_util";
import TerminalUtil from "../../../../../src/util/terminal_util";
import HtmlUtil from "../../../../../src/util/html_util.ts";

describe("Neofetch", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/html_util");

  vi.mocked(HtmlUtil.extractVisibleText).mockImplementation((html) => {
    // Does not work with all HTML, just a rough solution as JSDom does
    // not support innerText
    return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
  });

  test("should run with CommandUtil", () => {
    // Arrange
    const commandName = "neofetch";

    // Act & Assert
    expect(
      async () => await CommandUtil.executeCommand(commandName),
    ).not.toThrowError();

    expect(appendOutput).not.toHaveBeenCalledWith(
      `\n${commandName}: command not found`,
    );
  });
});
