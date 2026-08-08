import { beforeEach, describe, expect, test } from "vitest";
import Lexer, { Token, TokenType } from "../../../../../src/shell/lexer.ts";
import WordHandler from "../../../../../src/shell/handler/word_handler.ts";

describe("WordHandler", () => {
  // Other
  let wordHandler: WordHandler;

  beforeEach(() => {
    wordHandler = new WordHandler();
  });

  /**
   * Helper function for getting the next token
   * @param lexer
   * @param token
   */
  function getNextToken(lexer: Lexer, token?: Token): Token {
    token = token ?? { type: undefined, value: "" };
    lexer.consumeExcessWhitespace();
    wordHandler.nextToken(lexer, token);
    return token;
  }

  test("provides WORD Tokens for basic input", () => {
    // Arrange
    const lexer: Lexer = new Lexer("foo bar baz");

    // Act & Assert
    let token = getNextToken(lexer);
    expect(token).toStrictEqual({ type: TokenType.WORD, value: "foo" });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({ type: TokenType.WORD, value: "bar" });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({ type: TokenType.WORD, value: "baz" });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({ type: TokenType.WORD, value: "" });
  });

  [
    {
      input: "hello",
      expected: [{ type: TokenType.WORD, value: "hello" }],
    },
    {
      input: "foo'bar'",
      expected: [{ type: TokenType.WORD, value: "foo'bar'" }],
    },
    {
      input: "foo\"bar\"",
      expected: [{ type: TokenType.WORD, value: "foo\"bar\"" }],
    },
    {
      input: "\"foo bar\"baz",
      expected: [{ type: TokenType.WORD, value: "\"foo bar\"baz" }],
    },
    {
      input: "foo'bar baz'gaz",
      expected: [{ type: TokenType.WORD, value: "foo'bar baz'gaz" }],
    },
    {
      input: "foo bar",
      expected: [
        { type: TokenType.WORD, value: "foo" },
        { type: TokenType.WORD, value: "bar" },
      ],
    },
    {
      input: "\"foo bar\" baz",
      expected: [
        { type: TokenType.WORD, value: "\"foo bar\"" },
        { type: TokenType.WORD, value: "baz" },
      ],
    },
    {
      input: "foo\"bar baz\" gaz",
      expected: [
        { type: TokenType.WORD, value: "foo\"bar baz\"" },
        { type: TokenType.WORD, value: "gaz" },
      ],
    },
    {
      input: "git commit -m \"foo 'bar'\" and 'baz \"gaz'",
      expected: [
        { type: TokenType.WORD, value: "git" },
        { type: TokenType.WORD, value: "commit" },
        { type: TokenType.WORD, value: "-m" },
        { type: TokenType.WORD, value: "\"foo 'bar'\"" },
        { type: TokenType.WORD, value: "and" },
        { type: TokenType.WORD, value: "'baz \"gaz'" },
      ],
    },
    {
      input: "foo\\ bar baz gaz",
      expected: [
        { type: TokenType.WORD, value: "foo bar" },
        { type: TokenType.WORD, value: "baz" },
        { type: TokenType.WORD, value: "gaz" },
      ],
    },
  ].forEach(({ input, expected }) => {
    test(`provides expected WORD tokens for input: ${input}`, () => {
      // Arrange
      const lexer: Lexer = new Lexer(input);

      // Act
      const tokens: Token[] = [];

      while (true) {
        const token = getNextToken(lexer);
        if (token.value === "") {
          break;
        }

        tokens.push(token);
      }

      // Assert
      expect(tokens).toStrictEqual(expected);
    });
  });

  test("an undefined token value is overwritten", () => {
    // Arrange
    const lexer: Lexer = new Lexer("foo bar");
    const token = { type: undefined, value: undefined };

    // Act
    getNextToken(lexer, token);

    // Assert
    expect(token).toStrictEqual({ type: TokenType.WORD, value: "foo" });
  });
});
