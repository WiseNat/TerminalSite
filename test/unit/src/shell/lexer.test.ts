import { describe, expect, test, vi } from "vitest";
import Lexer, {
  LexerError,
  Token,
  TokenType,
} from "../../../../src/shell/lexer.ts";
import { escape } from "lodash-es";
import WordHandler from "../../../../src/shell/handler/word_handler.ts";

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
        expect(first).toStrictEqual({ type: TokenType.WORD, value: "foo" });
        expect(second).toStrictEqual({
          type: TokenType.WORD,
          value: "\"hello bar\"",
        });
        expect(third).toStrictEqual({ type: TokenType.WORD, value: "baz" });
      });

      test("produces EOF for an empty input", () => {
        // Arrange
        const lexer: Lexer = new Lexer("");

        // Act
        const token: Token = lexer.next().value;

        // Assert
        expect(token).toStrictEqual({ type: TokenType.EOF, value: null });
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
        expect(token).toStrictEqual({ type: TokenType.EOF, value: null });
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
          value: { type: TokenType.EOF, value: null },
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
          { type: TokenType.WORD, value: "foo" },
          { type: TokenType.WORD, value: "bar" },
          { type: TokenType.WORD, value: "baz" },
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
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.WORD, value: "hello" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "echo \"hello world\"",
          expected: [
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.WORD, value: "\"hello world\"" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "echo 'hello world'",
          expected: [
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.WORD, value: "'hello world'" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "echo foo\"bar\"baz",
          expected: [
            { type: TokenType.WORD, value: "echo" },
            { type: TokenType.WORD, value: "foo\"bar\"baz" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "mycommand foo -m bar",
          expected: [
            { type: TokenType.WORD, value: "mycommand" },
            { type: TokenType.WORD, value: "foo" },
            { type: TokenType.WORD, value: "-m" },
            { type: TokenType.WORD, value: "bar" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "mycommand",
          expected: [
            { type: TokenType.WORD, value: "mycommand" },
            { type: TokenType.EOF, value: null },
          ],
        },
        {
          input: "mycommand  ab \\r  'foo \\tbar' \\n ",
          expected: [
            { type: TokenType.WORD, value: "mycommand" },
            { type: TokenType.WORD, value: "ab" },
            { type: TokenType.WORD, value: "\\r" },
            { type: TokenType.WORD, value: "'foo \\tbar'" },
            { type: TokenType.WORD, value: "\\n" },
            { type: TokenType.TRAILING_WHITESPACE, value: null },
            { type: TokenType.EOF, value: null },
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
          { type: TokenType.WORD, value: "hello" },
          { type: TokenType.WORD, value: "world" },
          { type: TokenType.TRAILING_WHITESPACE, value: null },
          { type: TokenType.EOF, value: null },
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

  describe("appendTokenValue", () => {
    test("appends to an existing value", () => {
      // Arrange
      const token: Token = { type: TokenType.WORD, value: "foo" };

      // Act
      Lexer.appendTokenValue(token, "bar");

      // Assert
      expect(token.value).toStrictEqual("foobar");
    });

    test("appends to an empty value", () => {
      // Arrange
      const token: Token = { type: TokenType.WORD, value: "" };

      // Act
      Lexer.appendTokenValue(token, "foo");

      // Assert
      expect(token.value).toStrictEqual("foo");
    });

    test("appends to an undefined value", () => {
      // Arrange
      const token: Token = { type: TokenType.WORD, value: undefined };

      // Act
      Lexer.appendTokenValue(token, "foo");

      // Assert
      expect(token.value).toStrictEqual("foo");
    });
  });
});
