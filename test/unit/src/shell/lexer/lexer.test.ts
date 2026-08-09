import { describe, expect, test, vi } from "vitest";
import Lexer, { LexerError } from "../../../../../src/shell/lexer/lexer.ts";
import {
  Token,
  TokenPartType,
  TokenType,
} from "../../../../../src/shell/common.ts";
import { escape } from "lodash-es";
import WordHandler from "../../../../../src/shell/lexer/handler/word_handler.ts";

describe("Lexer", () => {
  describe("token", () => {
    describe("next", () => {
      test("returns the expected tokens in order", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo  \"hello bar\" baz");

        // Act
        const first: Token = lexer.next().value;
        const second: Token = lexer.next().value;
        const third: Token = lexer.next().value;

        // Assert
        expect(first).toStrictEqual({
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
        });
        expect(second).toStrictEqual({
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.DOUBLE_QUOTED, value: "hello bar" }],
        });
        expect(third).toStrictEqual({
          type: TokenType.WORD,
          parts: [{ type: TokenPartType.LITERAL, value: "baz" }],
        });
      });

      test("produces EOF for an empty input", () => {
        // Arrange
        const lexer: Lexer = new Lexer("");

        // Act
        const token: Token = lexer.next().value;

        // Assert
        expect(token).toStrictEqual({ type: TokenType.EOF, parts: null });
      });

      test("produces EOF once all other tokens have been provided", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        for (let i = 0; i < 3; i++) {
          lexer.next();
        }

        // Act
        const token: Token = lexer.next().value;

        // Assert
        expect(token).toStrictEqual({ type: TokenType.EOF, parts: null });
      });

      test("does not terminate iterator before EOF", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        for (let i = 0; i < 3; i++) {
          lexer.next();
        }

        // Act
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token: IteratorYieldResult<Token> | IteratorReturnResult<any> =
          lexer.next();

        // Assert
        expect(token).toStrictEqual({
          done: false,
          value: { type: TokenType.EOF, parts: null },
        });
      });

      test("terminates iterator after EOF", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        for (let i = 0; i < 4; i++) {
          lexer.next();
        }

        // Act
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token: IteratorYieldResult<Token> | IteratorReturnResult<any> =
          lexer.next();

        // Assert
        expect(token).toStrictEqual({ done: true, value: undefined });
      });

      test("continues producing a terminated iterator after calls after initial termination", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        for (let i = 0; i < 10; i++) {
          lexer.next();
        }

        // Act
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token: IteratorYieldResult<Token> | IteratorReturnResult<any> =
          lexer.next();

        // Assert
        expect(token).toStrictEqual({ done: true, value: undefined });
      });
    });

    describe("peek", () => {
      test("peeks at the next token without consuming it", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        const expectedTokens = [
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
        ];

        // Act & Assert
        expect(lexer.peek()).toStrictEqual(expectedTokens.at(0));
        expect(lexer.next().value).toStrictEqual(expectedTokens.at(0));

        expect(lexer.next().value).toStrictEqual(expectedTokens.at(1));

        expect(lexer.peek()).toStrictEqual(expectedTokens.at(2));
        expect(lexer.peek()).toStrictEqual(expectedTokens.at(2));
        expect(lexer.next().value).toStrictEqual(expectedTokens.at(2));
      });

      test("returns the same token for repeated peeks", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");

        // Act & Assert
        let previous: Token = lexer.peek();
        for (let i = 0; i < 100; i++) {
          const current = lexer.peek();
          expect(current).toEqual(previous);
          previous = current;
        }
      });
    });

    describe("lexing", () => {
      [
        {
          input: "echo hello",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "hello" }],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "echo \"hello world\"",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
            },
            {
              type: TokenType.WORD,
              parts: [
                { type: TokenPartType.DOUBLE_QUOTED, value: "hello world" },
              ],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "echo 'hello world'",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
            },
            {
              type: TokenType.WORD,
              parts: [
                { type: TokenPartType.SINGLE_QUOTED, value: "hello world" },
              ],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "echo foo\"bar\"baz",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "echo" }],
            },
            {
              type: TokenType.WORD,
              parts: [
                { type: TokenPartType.LITERAL, value: "foo" },
                { type: TokenPartType.DOUBLE_QUOTED, value: "bar" },
                { type: TokenPartType.LITERAL, value: "baz" },
              ],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "mycommand foo -m bar",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "mycommand" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "foo" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "-m" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "bar" }],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "mycommand",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "mycommand" }],
            },
            { type: TokenType.EOF, parts: null },
          ],
        },
        {
          input: "mycommand  ab \\r  'foo \\tbar' \\n ",
          expected: [
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "mycommand" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "ab" }],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "\\r" }],
            },
            {
              type: TokenType.WORD,
              parts: [
                { type: TokenPartType.SINGLE_QUOTED, value: "foo \\tbar" },
              ],
            },
            {
              type: TokenType.WORD,
              parts: [{ type: TokenPartType.LITERAL, value: "\\n" }],
            },
            { type: TokenType.TRAILING_WHITESPACE, parts: null },
            { type: TokenType.EOF, parts: null },
          ],
        },
      ].forEach(({ input, expected }) => {
        test(`lexes multiple words: ${input}`, () => {
          // Arrange
          const lexer: Lexer = new Lexer(input);

          // Act
          const tokens: Token[] = [...lexer];

          // Assert
          expect(tokens).toStrictEqual(expected);
        });
      });

      test("ignores whitespace between words", () => {
        // Arrange
        const lexer: Lexer = new Lexer("   hello       \tworld    ");

        // Act
        const tokens: Token[] = [...lexer];

        // Assert
        expect(tokens).toStrictEqual([
          {
            type: TokenType.WORD,
            parts: [{ type: TokenPartType.LITERAL, value: "hello" }],
          },
          {
            type: TokenType.WORD,
            parts: [{ type: TokenPartType.LITERAL, value: "world" }],
          },
          { type: TokenType.TRAILING_WHITESPACE, parts: null },
          { type: TokenType.EOF, parts: null },
        ]);
      });

      test("throws an error when a handler does not set the token type", () => {
        // Arrange
        vi.spyOn(WordHandler.prototype, "nextToken").mockImplementation(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (lexer, _token) => {
            // Emulating 'foo ' being consumed
            for (let i = 0; i < 4; i++) {
              lexer.nextChar();
            }
          },
        );
        const lexer: Lexer = new Lexer("foo bar");

        // Act & Assert
        expect(() => lexer.next()).toThrow(
          new LexerError(
            "cannot return a token with an undefined type; did a handler forget to set this? Starting character " +
              "before processing was f and the remaining stream after processing is [r, a, b]",
          ),
        );
      });
    });
  });

  describe("char", () => {
    describe("nextChar", () => {
      test("returns each character in order", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");

        // Act & Assert
        expect(lexer.nextChar()).toStrictEqual("f");
        expect(lexer.nextChar()).toStrictEqual("o");
        expect(lexer.nextChar()).toStrictEqual("o");
        expect(lexer.nextChar()).toStrictEqual(" ");
        expect(lexer.nextChar()).toStrictEqual("b");
      });

      test("produces undefined for an empty stream", () => {
        // Arrange
        const lexer: Lexer = new Lexer("");

        // Act
        const char = lexer.nextChar();

        // Assert
        expect(char).toBeUndefined();
      });

      test("produces undefined once all characters have been provided", () => {
        // Arrange
        const lexer: Lexer = new Lexer("abc");
        for (let i = 0; i < 3; i++) {
          lexer.nextChar();
        }

        // Act
        const char = lexer.nextChar();

        // Assert
        expect(char).toBeUndefined();
      });
    });

    describe("peekChar", () => {
      test("peeks at the next character without consuming it", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");
        const expectedChars = ["f", "o", "o"];

        // Act & Assert
        expect(lexer.peekChar()).toStrictEqual(expectedChars.at(0));
        expect(lexer.nextChar()).toStrictEqual(expectedChars.at(0));

        expect(lexer.nextChar()).toStrictEqual(expectedChars.at(1));

        expect(lexer.peekChar()).toStrictEqual(expectedChars.at(2));
        expect(lexer.peekChar()).toStrictEqual(expectedChars.at(2));
        expect(lexer.nextChar()).toStrictEqual(expectedChars.at(2));
      });

      test("returns the same character for repeated peeks", () => {
        // Arrange
        const lexer: Lexer = new Lexer("foo bar baz");

        // Act & Assert
        let previous = lexer.peekChar();
        for (let i = 0; i < 100; i++) {
          const current = lexer.peekChar();
          expect(current).toEqual(previous);
          previous = current;
        }
      });
    });

    describe("nextCharOrEscapeSequence", () => {
      test("returns the next character if it's not an escape sequence", () => {
        // Arrange
        const lexer: Lexer = new Lexer("a");

        // Act & Assert
        expect(lexer.nextCharOrEscapeSequence()).toStrictEqual("a");
      });

      test("returns the next escape sequence if it's an escape sequence", () => {
        // Arrange
        const lexer: Lexer = new Lexer("\\a");

        // Act & Assert
        expect(lexer.nextCharOrEscapeSequence()).toStrictEqual("\\a");
      });

      test("returns undefined once all characters have been provided", () => {
        // Arrange
        const lexer: Lexer = new Lexer("abc");
        lexer.nextChar();
        lexer.nextChar();
        lexer.nextChar();

        // Act & Assert
        expect(lexer.nextCharOrEscapeSequence()).toBeUndefined();
      });

      test("throws an error if the escape sequence is incomplete", () => {
        // Arrange
        const lexer: Lexer = new Lexer("\\");

        // Act & Assert
        expect(() => lexer.nextCharOrEscapeSequence()).toThrow(
          new LexerError(
            "incomplete escape sequence, expected character after '\\'",
          ),
        );
      });
    });
  });

  describe("consumeExcessWhitespace", () => {
    test("consumes all excess whitespace that exists", () => {
      // Arrange
      const lexer = new Lexer("    \t  \rbar");

      // Act
      lexer.consumeExcessWhitespace();

      // Assert
      expect(lexer.peekChar()).toStrictEqual("b");
    });

    test("consumes all characters when only whitespace exists", () => {
      // Arrange
      const lexer = new Lexer("    \t  \r");

      // Act
      lexer.consumeExcessWhitespace();

      // Assert
      expect(lexer.peekChar()).toBeUndefined();
    });
  });

  describe("isWhitespace", () => {
    [" ", "\t", "\r"].forEach((character: string) => {
      test(`returns true for whitespace character '${escape(character)}'`, () => {
        // Act
        const result: boolean = Lexer.isWhitespace(character);

        // Assert
        expect(result).toBeTruthy();
      });
    });

    ["a", "!", "*"].forEach((character: string) => {
      test(`returns false for non-whitespace character '${escape(character)}'`, () => {
        // Act
        const result: boolean = Lexer.isWhitespace(character);

        // Assert
        expect(result).toBeFalsy();
      });
    });
  });

  describe("appendPart", () => {
    test("appends to an existing list", () => {
      // Arrange
      const token: Token = {
        type: TokenType.WORD,
        parts: [
          { type: TokenPartType.LITERAL, value: "foo" },
          { type: TokenPartType.SINGLE_QUOTED, value: "bar" },
        ],
      };

      // Act
      Lexer.appendPart(token, {
        type: TokenPartType.DOUBLE_QUOTED,
        value: "baz",
      });

      // Assert
      expect(token.parts).toStrictEqual([
        { type: TokenPartType.LITERAL, value: "foo" },
        { type: TokenPartType.SINGLE_QUOTED, value: "bar" },
        { type: TokenPartType.DOUBLE_QUOTED, value: "baz" },
      ]);
    });

    test("appends to an empty list", () => {
      // Arrange
      const token: Token = {
        type: TokenType.WORD,
        parts: [],
      };

      // Act
      Lexer.appendPart(token, { type: TokenPartType.LITERAL, value: "foo" });

      // Assert
      expect(token.parts).toStrictEqual([
        { type: TokenPartType.LITERAL, value: "foo" },
      ]);
    });

    test("appends to an undefined list", () => {
      // Arrange
      const token: Token = {
        type: TokenType.WORD,
        parts: undefined,
      };

      // Act
      Lexer.appendPart(token, { type: TokenPartType.LITERAL, value: "foo" });

      // Assert
      expect(token.parts).toStrictEqual([
        { type: TokenPartType.LITERAL, value: "foo" },
      ]);
    });

    test("appends to an null list", () => {
      // Arrange
      const token: Token = {
        type: TokenType.WORD,
        parts: null,
      };

      // Act
      Lexer.appendPart(token, { type: TokenPartType.LITERAL, value: "foo" });

      // Assert
      expect(token.parts).toStrictEqual([
        { type: TokenPartType.LITERAL, value: "foo" },
      ]);
    });
  });
});
