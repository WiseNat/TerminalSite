import { describe, expect, test } from "vitest";
import { Token, TokenType } from "../../../../src/shell/lexer.ts";
import { SimpleCommand } from "../../../../src/shell/parser.ts";
import Expander from "../../../../src/shell/expander.ts";

describe("Expander", () => {
  describe("expand", () => {
    test("returns an execution command with a name and args when given a simple command with normal valid tokens", () => {
      // Arrange
      const tokens: Token[] = [
        { type: TokenType.WORD, value: "echo" },
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
        { type: TokenType.EOF, value: null },
      ];
      const simpleCommand: SimpleCommand = {
        type: "SimpleCommand",
        words: tokens,
      };

      // Act
      const command = Expander.expand(simpleCommand);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual(["foo", "bar"]);
    });

    test("returns an execution command with a name and no args when given a simple command with a single WORD token", () => {
      // Arrange
      const tokens: Token[] = [
        { type: TokenType.WORD, value: "echo" },
        { type: TokenType.EOF, value: null },
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
      const tokens: Token[] = [{ type: TokenType.EOF, value: null }];
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
        { type: TokenType.EOF, value: null },
        { type: TokenType.EOF, value: null },
        { type: TokenType.EOF, value: null },
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
        { type: TokenType.WORD, value: "echo" },
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
        { type: TokenType.WORD, value: "baz" },
        { type: TokenType.WORD, value: "gaz" },
        { type: TokenType.WORD, value: "daz" },
        { type: TokenType.TRAILING_WHITESPACE, value: null },
        { type: TokenType.EOF, value: null },
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

    // TODO: consume quotes test
    test("returns an execution command with no quotation marks when given a simple command with quotation mark tokens", () => {});

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
  });
});
