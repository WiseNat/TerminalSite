import { describe, expect, test } from "vitest";
import Lexer from "../../../../../src/shell/lexer/lexer.ts";
import {
  Token,
  TokenPartType,
  TokenType,
  SimpleCommand,
} from "../../../../../src/shell/common.ts";
import Parser from "../../../../../src/shell/parser/parser.ts";

describe("Parser", () => {
  describe("parse", () => {
    test("returns a simple command with tokens when given a lexer that has tokens", () => {
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
        { type: TokenType.EOF, parts: null },
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
