import { describe, expect, test } from "vitest";
import Expander from "../../../../../src/shell/expander/expander.ts";
import {
  Token,
  TokenPartType,
  TokenType,
  SimpleCommand,
} from "../../../../../src/shell/common.ts";

describe("Expander", () => {
  describe("expand", () => {
    test("returns an execution command with a name and args when given a simple command with normal valid tokens", () => {
      // Arrange
      const tokens: Token[] = [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
        },
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.DOUBLE_QUOTED, value: "bar" },
          ],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "baz" }],
        },
        { type: TokenType.EOF, parts: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual(["foobar", "baz"]);
    });

    test("returns an execution command with a name and no args when given a simple command with a single WORD token", () => {
      // Arrange
      const tokens: Token[] = [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
        },
        { type: TokenType.EOF, parts: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual([]);
    });

    test("returns an execution command with an empty name and no args when given a simple command with an EOF token", () => {
      // Arrange
      const tokens: Token[] = [{ type: TokenType.EOF, parts: null }];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });

    test("returns an execution command with an empty name and no args when given a simple command with multiple EOF tokens", () => {
      // Arrange
      const tokens: Token[] = [
        { type: TokenType.EOF, parts: null },
        { type: TokenType.EOF, parts: null },
        { type: TokenType.EOF, parts: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });

    test("returns an execution command with an empty string as the last element in args when given a simple command with trailing whitespace", () => {
      // Arrange
      const tokens: Token[] = [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "bar" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "baz" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "gaz" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "daz" }],
        },
        { type: TokenType.TRAILING_WHITESPACE, parts: null },
        { type: TokenType.EOF, parts: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual([
        "foo",
        "bar",
        "baz",
        "gaz",
        "daz",
        "",
      ]);
    });

    test("returns an execution command with no quotation marks when given a simple command with quotation mark tokens", () => {
      // Arrange
      const tokens: Token[] = [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
        },
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.DOUBLE_QUOTED, value: "bar" },
            { type: TokenPartType.SINGLE_QUOTED, value: "baz and" },
          ],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.SINGLE_QUOTED, value: "gaz" }],
        },
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.SINGLE_QUOTED, value: "with" },
            { type: TokenPartType.LITERAL, value: "occasionally" },
            { type: TokenPartType.LITERAL, value: "daz" },
          ],
        },
        { type: TokenType.EOF, parts: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual([
        "foobarbaz and",
        "gaz",
        "withoccasionallydaz",
      ]);
    });

    test("throws an error when given a command node with an invalid type", () => {
      // Arrange
      const simpleCommand: SimpleCommand = {
        // @ts-expect-error @typescript-eslint/ban-ts-comment
        type: "Foobar",
        words: [],
      };

      // Act & Assert
      expect(() => Expander.expand(simpleCommand)).toThrow(
        new Error("Unsupported Command Type 'Foobar'"),
      );
    });

    test("throws an error when given a token with an invalid token type", () => {
      // Arrange
      const tokens: Token[] = [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
        },
        {
          // @ts-expect-error @typescript-eslint/ban-ts-comment
          type: 1234,
          parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "bar" }],
        },
        { type: TokenType.EOF, parts: null },
      ];

      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act & Assert
      expect(() => Expander.expand(simpleCommand)).toThrow(
        new Error("Unsupported Token Type '1234'"),
      );
    });
  });
});
