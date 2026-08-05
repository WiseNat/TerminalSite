import WordHandler from "./handler/word_handler.ts";

// TODO: add more types!
export enum TokenType {
  WORD,
  EOF,
}

export type Token = {
  type: TokenType | undefined;
  value: string | null | undefined;
};

// TODO: class JSDoc?
// TODO: unit tests!
// https://gcc.gnu.org/onlinedocs/cppinternals/Lexer.html
// https://www.cs.uaf.edu/~chappell/class/2023_spr/cs331/lect/cs331-20230208-lex.pdf
export default class Lexer implements IterableIterator<Token> {
  private readonly charStream: string[];
  private bufferedToken: Token | null = null;
  private eofEmitted: boolean = false;

  private wordHandler: WordHandler = new WordHandler();

  constructor(stream: string) {
    // Reverse collection to enable performant popping when getting the next token
    this.charStream = stream.split("").reverse();
  }

  // TODO: JSDoc
  public [Symbol.iterator](): IterableIterator<Token> {
    return this;
  }

  // TODO: improve JSDoc
  // TODO: test me!
  /**
   * @returns consumes the next valid {@link Token} in the provided `stream`, or a {@link TokenType#EOF} once the
   * `stream` has been fully consumed.
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
   * @returns consumes and returns the next char. For {@link Token} next-ing, see {@link next}.
   */
  public nextChar(): string | undefined {
    return this.charStream.pop();
  }

  // TODO: improve JSDoc
  // TODO: test me!
  /**
   * @returns the next valid {@link Token} in the provided `stream`, or a {@link TokenType#EOF} once the
   * `stream` has been fully consumed.
   */
  public peek(): Token {
    if (this.bufferedToken === null) {
      this.bufferedToken = this.nextToken();
    }

    return this.bufferedToken;
  }

  /**
   * @returns the next character in the provided `stream`. For {@link Token} peeking, see {@link peek}.
   * @private
   */
  public peekChar(): string | undefined {
    return this.charStream.at(-1);
  }

  // TODO: improve JSDoc with info on how tokenising works at a low level
  /**
   * Gets and consumes the next valid {@link Token} in the provided `stream`, or a {@link TokenType#EOF} once the
   * `stream` has been fully consumed.
   * <p>
   * Tokens are determined by ????
   *
   * @private
   */
  private nextToken(): Token {
    if (this.charStream.length === 0) {
      return {
        type: TokenType.EOF,
        value: null,
      };
    }

    // TODO: add additional lexer rules! e.g.
    //  - Double Quoting
    //  - Single Quoting
    //  - Parameterisation '$', '${', "$(", "$((" ?
    //  - Escaping Chars
    //  - Ignore newlines?
    // TODO: ensure 'maximal munch'!

    // TODO: change logic to "peek" at next char, then determine what handler to pass to?
    //  Below is the basis of for the word handler?

    // TODO: logic for undefined?
    const nextChar: string = this.peekChar()!;

    this.consumeExcessWhitespace(nextChar);

    // TODO: check for undefined after passing to handlers?...
    const token: Token = { type: undefined, value: undefined };

    switch (nextChar) {
      default:
        this.wordHandler.nextToken(this, token);
    }

    // TODO: IF next char is a " THEN delegate to doubleQuoteHandler (handler continues processing until an unescaped " or EOF is hit)
    // TODO: IF next char is a ' THEN delegate to singleQuoteHandler (handler continues processing until an unescaped ' or EOF is hit)

    return token;
  }

  // TODO: JSDoc
  // TODO: unit tests for me?
  private consumeExcessWhitespace(nextChar: string) {
    let char: string | undefined = nextChar;

    // TODO: ??? return EOF somehow for undefined?
    while (char !== undefined && this.isWhitespace(char)) {
      // TODO: check for end of charStream?
      this.nextChar();
      char = this.peekChar();
    }
  }

  // TODO: migrate to util?
  // TODO: JSDoc
  // TODO: tests for this!
  public isWhitespace(char: string) {
    return [" ", "\t", "\r"].includes(char);
  }
}
