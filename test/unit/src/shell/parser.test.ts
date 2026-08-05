import { describe, expect, test } from "vitest";
import Lexer, { TokenType } from "../../../../src/shell/lexer.ts";
import Parser from "../../../../src/shell/parser.ts";

describe("Parser", () => {
  describe("parse", () => {
    test("returns a command with a name and args when given a lexer with normal valid tokens", () => {
      // Arrange
      const lexer = {
        *[Symbol.iterator]() {
          yield* [
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.WORD, value: "foo" },
            { type: TokenType.WORD, value: "bar" },
            { type: TokenType.EOF, value: null },
          ];
        },
      } as unknown as Lexer;

      // Act
      const command = Parser.parse(lexer);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual(["foo", "bar"]);
    });

    test("returns a command with a name and no args when given a lexer with a single WORD token", () => {
      // Arrange
      const lexer = {
        *[Symbol.iterator]() {
          yield* [
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.EOF, value: null },
          ];
        },
      } as unknown as Lexer;

      // Act
      const command = Parser.parse(lexer);

      // Assert
      expect(command.name).toBe("echo");
      expect(command.args).toStrictEqual([]);
    });

    test("returns a command with an empty name and no args when given a lexer with an EOF token", () => {
      // Arrange
      const lexer = {
        *[Symbol.iterator]() {
          yield* [{ type: TokenType.EOF, value: null }];
        },
      } as unknown as Lexer;

      // Act
      const command = Parser.parse(lexer);

      // Assert
      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });

    test("returns a command with an empty name and no args when given a lexer with multiple EOF tokens", () => {
      // Arrange
      const lexer = {
        *[Symbol.iterator]() {
          yield* [{ type: TokenType.EOF, value: null }];
          yield* [{ type: TokenType.EOF, value: null }];
          yield* [{ type: TokenType.EOF, value: null }];
        },
      } as unknown as Lexer;

      // Act
      const command = Parser.parse(lexer);

      // Assert
      expect(command.name).toBe("");
      expect(command.args).toStrictEqual([]);
    });
  });
});
