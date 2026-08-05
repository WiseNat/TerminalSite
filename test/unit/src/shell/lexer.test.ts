// TODO: tests!!!

import { describe, expect, test } from "vitest";
import Lexer, { Token, TokenType } from "../../../../src/shell/lexer.ts";

describe("Lexer", () => {
  // TODO: tests...
  //  - multiple spaces?

  // TODO: delete me!
  test("WORKSHOP", () => {
    // Arrange
    const lexer: Lexer = new Lexer("echo -e 'foo'");
    console.log(lexer.next().value);
    console.log(lexer.next().value);

    // Act
    for (let i = 0; i < 5; i++) {
      const token = lexer.peek();
      console.log(token);
    }

    // Assert
  });

  // TODO: fix test naming
  // TODO: aggregate tests into rules?

  describe("next", () => {
    test("empty input > just EOF token", () => {
      // Arrange
      const lexer: Lexer = new Lexer("");

      // Act
      const tokens = [...lexer];

      // Assert
      console.log(tokens);
      expect(tokens).toStrictEqual([{ type: TokenType.EOF, value: null }]);
    });

    test("single word input > word, eof", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo");

      // Act
      const tokens = [...lexer];

      // Assert
      console.log(tokens);
      expect(tokens).toStrictEqual([
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.EOF, value: null },
      ]);
    });

    test("multiple words > word, word, word, eof", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo bar baz");

      // Act
      const tokens = [...lexer];

      // Assert
      console.log(tokens);
      expect(tokens).toStrictEqual([
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
        { type: TokenType.WORD, value: "baz" },
        { type: TokenType.EOF, value: null },
      ]);
    });

    test("multiple words with multiple spaces", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo  bar \tbaz");

      // Act
      const tokens = [...lexer];

      // Assert
      console.log(tokens);
      expect(tokens).toStrictEqual([
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
        { type: TokenType.WORD, value: "baz" },
        { type: TokenType.EOF, value: null },
      ]);
    });
  });

  describe("peek", () => {
    // TODO: tests!

    test("empty input > EOF", () => {
      // Arrange
      const lexer: Lexer = new Lexer("");

      // Act
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.EOF, value: null });
    });

    test("one word input > word", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo");

      // Act
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.WORD, value: "foo" });
    });

    test("multi word input > first word", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo bar baz");

      // Act
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.WORD, value: "foo" });
    });

    test("multi word input + next > second word", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo bar baz");

      // Act
      lexer.next();
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.WORD, value: "bar" });
    });

    test("multi word input + fully consumed next > eof", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo bar baz");

      // Act
      lexer.next();
      lexer.next();
      lexer.next();
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.EOF, value: null });
    });

    test("multi word input + next + multi peeks > second word", () => {
      // Arrange
      const lexer: Lexer = new Lexer("foo bar baz");

      // Act
      lexer.next();
      lexer.peek();
      lexer.peek();
      lexer.peek();
      const token: Token = lexer.peek();

      // Assert
      expect(token).toStrictEqual({ type: TokenType.WORD, value: "bar" });
    });
  });
});
