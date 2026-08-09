import { beforeEach, describe, expect, test } from "vitest";
import Lexer, {
  LexerError,
  Token,
  TokenPartType,
  TokenType,
} from "../../../../../../src/shell/lexer/lexer.ts";
import WordHandler from "../../../../../../src/shell/lexer/handler/word_handler.ts";

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
    token = token ?? { type: undefined, parts: undefined };
    lexer.consumeExcessWhitespace();
    wordHandler.nextToken(lexer, token);
    return token;
  }

  test("provides WORD Tokens for basic input", () => {
    // Arrange
    const lexer: Lexer = new Lexer("foo bar baz");

    // Act & Assert
    let token = getNextToken(lexer);
    expect(token).toStrictEqual({
      type: TokenType.WORD,
      parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
    });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({
      type: TokenType.WORD,
      parts: [{ type: TokenPartType.LITERAL, value: "bar" }],
    });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({
      type: TokenType.WORD,
      parts: [{ type: TokenPartType.LITERAL, value: "baz" }],
    });

    token = getNextToken(lexer);
    expect(token).toStrictEqual({ type: TokenType.WORD, parts: undefined });
  });

  [
    {
      input: "hello",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "hello" }],
        },
      ],
    },
    {
      input: "foo'bar'",
      expected: [
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.SINGLE_QUOTED, value: "bar" },
          ],
        },
      ],
    },
    {
      input: "foo\"bar\"",
      expected: [
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.DOUBLE_QUOTED, value: "bar" },
          ],
        },
      ],
    },
    {
      input: "\"foo bar\"baz",
      expected: [
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.DOUBLE_QUOTED, value: "foo bar" },
            { type: TokenPartType.LITERAL, value: "baz" },
          ],
        },
      ],
    },
    {
      input: "foo'bar baz'gaz",
      expected: [
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.SINGLE_QUOTED, value: "bar baz" },
            { type: TokenPartType.LITERAL, value: "gaz" },
          ],
        },
      ],
    },
    {
      input: "foo bar",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "bar" }],
        },
      ],
    },
    {
      input: "f\\\"oo ba\\'r",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "f\\\"oo" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "ba\\'r" }],
        },
      ],
    },
    {
      input: "\"foo bar\" baz",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.DOUBLE_QUOTED, value: "foo bar" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "baz" }],
        },
      ],
    },
    {
      input: "foo\"bar baz\" gaz",
      expected: [
        {
          type: TokenType.WORD,
          parts: [
            { type: TokenPartType.LITERAL, value: "foo" },
            { type: TokenPartType.DOUBLE_QUOTED, value: "bar baz" },
          ],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "gaz" }],
        },
      ],
    },
    {
      input: "git commit -m \"foo 'bar'\" and 'baz \"gaz'",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "git" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "commit" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "-m" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.DOUBLE_QUOTED, value: "foo 'bar'" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "and" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.SINGLE_QUOTED, value: "baz \"gaz" }],
        },
      ],
    },
    {
      input: "foo\\ bar ba\\z gaz",
      expected: [
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "foo\\ bar" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "ba\\z" }],
        },
        {
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "gaz" }],
        },
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
        if (token.parts === undefined) {
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
    const token = { type: undefined, parts: undefined };

    // Act
    getNextToken(lexer, token);

    // Assert
    expect(token).toStrictEqual({
      type: TokenType.WORD,
      parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
    });
  });

  test("throws an error for an incomplete escape sequence", () => {
    // Arrange
    const lexer: Lexer = new Lexer("foo\\");

    // Act & Assert
    expect(() => getNextToken(lexer)).toThrow(
      new LexerError(
        "incomplete escape sequence, expected character after '\\'",
      ),
    );
  });
});
