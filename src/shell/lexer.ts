import WordHandler from "./handler/word_handler.ts";

export enum TokenType {
  WORD,
  TRAILING_WHITESPACE,
  EOF,
}

export enum TokenPartType {
  LITERAL,
  SINGLE_QUOTED,
  DOUBLE_QUOTED,
}

export type TokenPart = {
  type: TokenPartType;
  value: string | undefined;
};

export type Token = {
  type: TokenType | undefined;
  parts: TokenPart[] | null | undefined;
};

export class LexerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LexerError";
    Object.setPrototypeOf(this, LexerError.prototype);
  }
}

/**
 * Lexer for iterating over a command stream and providing individual {@link Token Tokens} at a time.
 * Loosely based on the following Lexer - https://github.com/Maybe1or0/42sh/blob/main/42sh/src/lexer/lexer.c
 *
 * The following links may be useful:
 * - https://gcc.gnu.org/onlinedocs/cppinternals/Lexer.html
 * - https://www.cs.uaf.edu/~chappell/class/2023_spr/cs331/lect/cs331-20230208-lex.pdf
 */
export default class Lexer implements IterableIterator<Token> {
  private readonly charStream: string[];
  private bufferedToken: Token | null = null;
  private eofEmitted: boolean = false;

  private wordHandler: WordHandler = new WordHandler();

  constructor(stream: string) {
    // Reverse collection to enable performant popping when getting the next token
    this.charStream = stream.split("").reverse();
  }

  public [Symbol.iterator](): IterableIterator<Token> {
    return this;
  }

  /**
   * Consumes the next valid {@link Token} in the `stream` provided to the constructor.
   *
   * @returns the next {@link Token} or a {@link TokenType.EOF} if the `stream` has been fully consumed.
   * @see {@link peek} for peeking at the next {@link Token}
   * @throws Error if the provided `stream` has invalid contents
   */
  public next(): IteratorResult<Token> {
    if (this.eofEmitted) {
      return {
        done: true,
        value: undefined,
      };
    }

    const token = this.bufferedToken ?? this.nextToken();
    this.bufferedToken = null;

    if (token.type === TokenType.EOF) {
      this.eofEmitted = true;
    }

    return {
      done: false,
      value: token,
    };
  }

  /**
   * Peeks at the next valid {@link Token} in the `stream` provided to the constructor.
   * <p>
   * This is not a pure method call as handlers downstream will consume from the Lexer's `stream`. This means that calls
   * to {@link peekChar} before and after a {@link peek} call will differ.
   *
   * @returns the next {@link Token} or a {@link TokenType.EOF} if the `stream` has been fully consumed.
   * @see {@link next} for consuming the next {@link Token}
   * @throws Error if the provided `stream` has invalid contents
   */
  public peek(): Token {
    if (this.bufferedToken === null) {
      this.bufferedToken = this.nextToken();
    }

    return this.bufferedToken;
  }

  /**
   * Consumes and returns the next character in the `stream`
   *
   * @see {@link peekChar} for peeking at the next character
   * @returns the next char if available or undefined if the `stream` has been fully consumed
   */
  public nextChar(): string | undefined {
    return this.charStream.pop();
  }

  /**
   * Gets the next character in the provided `stream`.
   *
   * @see {@link nextChar} for consuming the next character
   * @returns the next char if available or undefined if the `stream` has been fully consumed
   */
  public peekChar(): string | undefined {
    return this.charStream.at(-1);
  }

  /**
   * Gets the next character or escape sequence in the provided `stream`.
   *
   * @see {@link nextChar} for consuming the next character
   * @returns the next char or escape sequence if available or undefined if the `stream` has been fully consumed
   */
  public nextCharOrEscapeSequence(): string | undefined {
    const char: string | undefined = this.nextChar();

    if (char === undefined || char !== "\\") {
      return char;
    }

    const nextChar = this.nextChar();

    if (nextChar === undefined) {
      throw new LexerError(
        "incomplete escape sequence, expected character after '\\'",
      );
    }

    return char + nextChar;
  }

  /**
   * Gets the next valid {@link Token} in the provided `stream`.
   * If the `stream` has been fully consumed, this will continue to return a
   * {@link TokenType.EOF} {@link Token} with a `null` value.
   * <p>
   * This generates tokens in blocks by delegating to {@link Handler} classes
   * based on the initial encountered token. These {@link Handler Handlers} may
   * in term call other {@link Handler Handlers} to generate a {@link Token}.
   *
   * @private
   * @throws Error if the provided `stream` has invalid contents
   */
  private nextToken(): Token {
    if (this.charStream.length === 0) {
      return {
        type: TokenType.EOF,
        parts: null,
      };
    }

    this.consumeExcessWhitespace();

    // Exists solely to support autocompletion
    if (this.charStream.length === 0) {
      return {
        type: TokenType.TRAILING_WHITESPACE,
        parts: null,
      };
    }

    // TODO: add additional lexer rules! e.g.
    //  - Parameterisation '$', '${', "$(", "$((" ?
    //  - Escaping Chars - need e2e tests for this!
    //  - Ignore newlines? need e2e tests for this!

    const nextChar: string = this.peekChar()!;
    const token: Token = { type: undefined, parts: undefined };

    // No other handlers required as of now. The 'switch' is here for when functionality such as pipelines or IO
    // redirections are implemented, in which case handlers should be added below.
    switch (nextChar) {
      default:
        this.wordHandler.nextToken(this, token);
    }

    if (token.type === undefined) {
      throw new LexerError(
        "cannot return a token with an undefined type; did a handler forget to set this? " +
          `Starting character before processing was ${nextChar} and the remaining stream after processing is [${this.charStream.join(", ")}]`,
      );
    }

    return token;
  }

  /**
   * Consumes the `stream` until it reaches a character that is not whitespace.
   * <p>
   * Intended to be used to consume excess initial whitespace before handing off to {@link Handler Handlers}.
   *
   * @private
   */
  public consumeExcessWhitespace() {
    let char: string | undefined = this.peekChar();

    while (char !== undefined && Lexer.isWhitespace(char)) {
      this.nextChar();
      char = this.peekChar();
    }
  }

  /**
   * @param char the character to check
   * @returns `true` if the `char` is whitespace, false otherwise
   */
  public static isWhitespace(char: string) {
    return [" ", "\t", "\r"].includes(char);
  }

  /**
   * Safely appends a `part` to the provided {@link Token} `parts`. Useful for when the token parts value is unknown.
   *
   * @param token the {@link Token} to modify
   * @param part the part to append
   */
  public static appendPart(token: Token, part: TokenPart) {
    if (token.parts === undefined || token.parts === null) {
      token.parts = [part];
    } else {
      token.parts.push(part);
    }
  }
}
