import { describe, expect, test } from "vitest";
import Lexer, { Token, TokenType } from "../../../../src/shell/lexer.ts";
import Parser, { SimpleCommand } from "../../../../src/shell/parser.ts";

describe("Parser", () => {
  describe("parse", () => {
    test("returns a simple command with tokens when given a lexer that has tokens", () => {
      // Arrange
      const tokens: Token[] = [
        { type: TokenType.WORD, value: "echo" },
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
        { type: TokenType.EOF, value: null },
      ];

      const lexer = {
        *[Symbol.iterator]() {
          yield* tokens;
        },
      } as unknown as Lexer;

      // Act
      const simpleCommand: SimpleCommand = Parser.parse(lexer);

      // Assert
      expect(simpleCommand.type).toStrictEqual("SimpleCommand");
      expect(simpleCommand.words).toStrictEqual(tokens);
    });

    test("returns a simple command with no tokens when given a lexer without tokens", () => {
      // Arrange
      const lexer = {
        *[Symbol.iterator]() {
          yield* [];
        },
      } as unknown as Lexer;

      // Act
      const simpleCommand: SimpleCommand = Parser.parse(lexer);

      // Assert
      expect(simpleCommand.type).toStrictEqual("SimpleCommand");
      expect(simpleCommand.words).toStrictEqual([]);
    });
  });
});
