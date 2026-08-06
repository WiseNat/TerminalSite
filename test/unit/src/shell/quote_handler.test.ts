import { beforeEach, describe, expect, test } from "vitest";
import QuoteHandler from "../../../../src/shell/handler/quote_handler.ts";
import Lexer, {
  LexerError,
  Token,
  TokenType,
} from "../../../../src/shell/lexer.ts";

describe("Quote Handler", () => {
  ["\"", "'"].forEach((quoteChar) => {
    // Other
    let quoteHandler: QuoteHandler;

    beforeEach(() => {
      quoteHandler = new QuoteHandler(quoteChar);
    });

    /**
     * Helper function for getting the next token
     * @param lexer
     * @param token
     */
    function getNextToken(lexer: Lexer, token?: Token): Token {
      token = token ?? { type: TokenType.WORD, value: "" };
      lexer.consumeExcessWhitespace();
      quoteHandler.nextToken(lexer, token);
      return token;
    }

    [
      {
        input: `${quoteChar}hello${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}hello${quoteChar}` },
        ],
      },
      {
        input: `${quoteChar}${quoteChar}`,
        expected: [{ type: TokenType.WORD, value: `${quoteChar}${quoteChar}` }],
      },
      {
        input: `${quoteChar}hello world${quoteChar}`,
        expected: [
          {
            type: TokenType.WORD,
            value: `${quoteChar}hello world${quoteChar}`,
          },
        ],
      },
      {
        input: `${quoteChar}$foo${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}$foo${quoteChar}` },
        ],
      },
      {
        input: `${quoteChar}$(foo)${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}$(foo)${quoteChar}` },
        ],
      },
      {
        input: `${quoteChar}test\\"ing${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}test\\"ing${quoteChar}` },
        ],
      },
      {
        input: `${quoteChar}test\\'ing${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}test\\'ing${quoteChar}` },
        ],
      },
      {
        input: `${quoteChar}the first${quoteChar}${quoteChar}word${quoteChar}`,
        expected: [
          { type: TokenType.WORD, value: `${quoteChar}the first${quoteChar}` },
          { type: TokenType.WORD, value: `${quoteChar}word${quoteChar}` },
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

    test("an undefined token value is overwritten", () => {
      // Arrange
      const lexer: Lexer = new Lexer(`${quoteChar}foo bar${quoteChar}`);
      const token = { type: TokenType.WORD, value: undefined };

      // Act
      getNextToken(lexer, token);

      // Assert
      expect(token).toStrictEqual({
        type: TokenType.WORD,
        value: `${quoteChar}foo bar${quoteChar}`,
      });
    });

    test("missing quotation character at the start throws an error", () => {
      // Arrange
      const lexer: Lexer = new Lexer(`foo bar${quoteChar}`);
      const token = { type: TokenType.WORD, value: undefined };

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
      const token = { type: TokenType.WORD, value: undefined };

      // Act & Assert
      expect(() => getNextToken(lexer, token)).toThrow(
        new LexerError(
          `unexpected EOF while looking for a matching ${quoteChar}`,
        ),
      );
    });
  });
});
