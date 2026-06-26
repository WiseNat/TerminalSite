import { test } from "../fixture";
import {
  assertExactTextInTerminal,
  assertOutputInTerminal,
  runCommand,
} from "../helper/util/terminal_util.ts";
import { COMMAND_RAN_OUTPUT } from "../helper/constant/generic.ts";

test.describe("Variable Substitution", () => {
  [
    {
      variable: "$HOME",
      expected: "/src/main/nathanwise",
    },
    {
      variable: "a$HOME",
      expected: "a/src/main/nathanwise",
    },
    {
      variable: "a$HOMEb",
      expected: "a",
    },
    {
      variable: "a$HOME b",
      expected: "a/src/main/nathanwise b",
    },
    {
      variable: "${HOME}",
      expected: "/src/main/nathanwise",
    },
    {
      variable: "a${HOME}",
      expected: "a/src/main/nathanwise",
    },
    {
      variable: "a${HOME}b",
      expected: "a/src/main/nathanwiseb",
    },
    {
      variable: "\"a${HOME}b\"",
      expected: "a/src/main/nathanwiseb",
    },
    {
      variable: "'a${HOME}b'",
      expected: "a${HOME}b",
    },
  ].forEach(async ({ variable, expected }) => {
    test(`should replace ${variable} with ${expected}`, async ({ page }) => {
      // Arrange
      const input = `echo ${variable}`;

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });

  // TODO: tests for ALL default variables
  [
    {
      variable: "$HOME",
      expected: "/src/main/nathanwise",
    },
    {
      variable: "$HOSTNAME",
      expected: "portfolio",
    },
    {
      variable: "$PWD",
      expected: "/src/main/nathanwise",
    },
    {
      variable: "$USER",
      expected: "nathanwise",
    },
  ].forEach(async ({ variable, expected }) => {
    test(`should replace default variable ${variable} with ${expected}`, async ({
      page,
    }) => {
      // Arrange
      const input = `echo ${variable}`;

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });

  test.describe("HOME", () => {
    test("should be replaced with the Home Directory", async ({ page }) => {
      // Arrange
      const input = "echo $HOME";

      // Act
      await runCommand(page, input);

      // Assert
      const expected = "/src/main/nathanwise";
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });

  test.describe("HOSTNAME", () => {
    test("should be replaced with the system hostname", async ({ page }) => {
      // Arrange
      const input = "echo $HOSTNAME";

      // Act
      await runCommand(page, input);

      // Assert
      const expected = "portfolio";
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });

  test.describe("PWD", () => {
    test("should be replaced with the default current working directory", async ({
      page,
    }) => {
      // Arrange
      const input = "echo $PWD";

      // Act
      await runCommand(page, input);

      // Assert
      const expected = "/src/main/nathanwise";
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });

    test("should be replaced with the current working directory when the current working directory changes", async ({
      page,
    }) => {
      // Arrange
      const newCwd = "/downloads";
      const firstInput = `cd ${newCwd}`;
      await runCommand(page, firstInput);
      const secondInput = "echo $PWD";

      // Act
      await runCommand(page, secondInput);

      // Assert
      const expectedPrompt = "nathanwise@portfolio:/downloads$ ";
      await assertExactTextInTerminal(
        page,
        `${COMMAND_RAN_OUTPUT}${firstInput}\n${expectedPrompt}${secondInput}\n${newCwd}`,
        expectedPrompt,
      );
    });
  });

  test.describe("USER", () => {
    test("should be replaced with the system username", async ({ page }) => {
      // Arrange
      const input = "echo $USER";

      // Act
      await runCommand(page, input);

      // Assert
      const expected = "nathanwise";
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });
});
