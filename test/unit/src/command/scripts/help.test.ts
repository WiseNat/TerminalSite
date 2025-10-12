import { describe, test, vi } from "vitest";

describe("Help", () => {
  // Spy
  // const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  // TODO: any other unit test specific test cases
  // TODO: multi-flag tests. Priority?

  describe("run", async () => {
    [
      {
        type: "no flags",
        flags: "",
      },
      {
        type: "short description flag",
        flags: "-d",
      },
      {
        type: "usage synopsis flag",
        flags: "-s",
      },
    ].forEach(({ type, flags }) => {
      test(`given no args & ${type}, should output a list of short usage synopses for all available commands across two columns`, async () => {
        // TODO: impl!
        console.warn(flags);
        // TODO: columns work by limiting both columns to a max length and truncating the text. Replacing any extra with a >
        //  This means mobile and desktop will have different values!
      });
    });

    test("given a command and no flags, should output the full help information for that command", async () => {
      // TODO: impl!
    });

    test("given multiple commands and no flags, should output the full help information for the first command", async () => {
      // TODO: impl!
    });

    describe("short description flag: -d", () => {
      test("given a command and the short description flag, should output a short short description for that command", async () => {
        // TODO: impl!
      });
    });

    describe("usage synopsis flag: -s", () => {
      test("given a command and the usage synopsis flag, should output a short usage synopsis for that command", async () => {
        // TODO: impl!
      });
    });
  });
});
