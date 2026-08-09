import { beforeEach, describe, expect, test } from "vitest";
import QuoteHandler from "../../../../../src/shell/handler/quote_handler.ts";
import Lexer, {
  LexerError,
  Token,
  TokenPartType,
  TokenType,
} from "../../../../../src/shell/lexer.ts";

describe("Quote Handler", () => {
  [
    { quoteChar: "\"", tokenPartType: TokenPartType.DOUBLE_QUOTED },
    { quoteChar: "'", tokenPartType: TokenPartType.SINGLE_QUOTED },
  ].forEach(({ quoteChar, tokenPartType }) => {
    // Other
    let quoteHandler: QuoteHandler;

    beforeEach(() => {
      quoteHandler = new QuoteHandler(quoteChar, tokenPartType);
    });

    /**
     * Helper function for getting the next token
     * @param lexer
     * @param token
     */
    function getNextToken(lexer: Lexer, token?: Token): Token {
      token = token ?? { type: TokenType.WORD, parts: [] };
      lexer.consumeExcessWhitespace();
      quoteHandler.nextToken(lexer, token);
      return token;
    }

    [
      {
        input: `${quoteChar}hello${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "hello" }],
          },
        ],
      },
      {
        input: `${quoteChar}${quoteChar}`,
        expected: [
          { type: TokenType.WORD, parts: [{ type: tokenPartType, value: "" }] },
        ],
      },
      {
        input: `${quoteChar}hello world${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "hello world" }],
          },
        ],
      },
      {
        input: `${quoteChar}$foo${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "$foo" }],
          },
        ],
      },
      {
        input: `${quoteChar}$(foo)${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "$(foo)" }],
          },
        ],
      },
      {
        input: `${quoteChar}test\\"ing${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "test\\\"ing" }],
          },
        ],
      },
      {
        input: `${quoteChar}test\\'ing${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "test\\'ing" }],
          },
        ],
      },
      {
        input: `${quoteChar}the first${quoteChar}${quoteChar}word${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "the first" }],
          },
          {
            type: TokenType.WORD,
            parts: [{ type: tokenPartType, value: "word" }],
          },
        ],
      },
    ].forEach(({ input, expected }) => {
      test(`provides expected WORD tokens for input: ${input}`, () => {
        // Arrange
        const lexer: Lexer = new Lexer(input);

        // Act
        const tokens: Token[] = [];

        while (lexer.peekChar() !== undefined) {
          const token = getNextToken(lexer);
          tokens.push(token);
        }

        // Assert
        expect(tokens).toStrictEqual(expected);
      });
    });

    test("an undefined token part is appended to", () => {
      // Arrange
      const lexer: Lexer = new Lexer(`${quoteChar}foo bar${quoteChar}`);
      const token = { type: TokenType.WORD, parts: undefined };

      // Act
      getNextToken(lexer, token);

      // Assert
      expect(token).toStrictEqual({
        type: TokenType.WORD,
        parts: [{ type: tokenPartType, value: "foo bar" }],
      });
    });

    test("missing quotation character at the start throws an error", () => {
      // Arrange
      const lexer: Lexer = new Lexer(`foo bar${quoteChar}`);
      const token = { type: TokenType.WORD, parts: undefined };

      // Act & Assert
      expect(() => getNextToken(lexer, token)).toThrow(
        new LexerError(
          `expected an initial ${quoteChar} when parsing - has this accidentally been consumed`,
        ),
      );
    });

    test("missing quotation character at the end throws an error", () => {
      // Arrange
      const lexer: Lexer = new Lexer(`${quoteChar}foo bar`);
      const token = { type: TokenType.WORD, parts: undefined };

      // Act & Assert
      expect(() => getNextToken(lexer, token)).toThrow(
        new LexerError(
          `unexpected EOF while looking for a matching ${quoteChar}`,
        ),
      );
    });
  });
});
