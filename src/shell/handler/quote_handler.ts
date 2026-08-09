import Lexer, {
  LexerError,
  Token,
  TokenPart,
  TokenPartType,
} from "../lexer.ts";
import { Handler } from "./handler.ts";

export default class QuoteHandler implements Handler {
  private readonly quoteChar: string;
  private readonly tokenPartType: TokenPartType;

  /**
   * @param quoteChar the quotation character this should expect, typically either `'` or `"`
   * @param tokenPartType the {@link TokenPartType} the {@link Token} parts in {@link nextToken} should be set to
   */
  constructor(quoteChar: string, tokenPartType: TokenPartType) {
    this.quoteChar = quoteChar;
    this.tokenPartType = tokenPartType;
  }

  /**
   * Populates the next {@link Token} value by appending all non-quotation characters.
   * <p>
   * Expects an initial quotation character - the same character passed into the constructor - and a terminating
   * quotation character, otherwise an error is thrown.
   *
   * @param lexer the {@link Lexer} to consume from
   * @param token the {@link Token} to write the result to
   */
  public nextToken(lexer: Lexer, token: Token): void {
    const tokenPart: TokenPart = { type: this.tokenPartType, value: "" };
    Lexer.appendPart(token, tokenPart);

    // Consume initial quote char
    let char = lexer.nextChar();
    if (char !== this.quoteChar) {
      throw new LexerError(
        `expected an initial ${this.quoteChar} when parsing - has this accidentally been consumed`,
      );
    }

    // TODO: special logic for escaped quote!
    while (this.isValidChar(lexer.peekChar())) {
      char = lexer.nextChar()!;
      tokenPart.value += char;
    }

    // Consume terminating quote char
    char = lexer.nextChar();
    if (char === undefined) {
      throw new LexerError(
        `unexpected EOF while looking for a matching ${this.quoteChar}`,
      );
    } else if (char !== this.quoteChar) {
      throw new LexerError(
        `unexpected character "${char}" while looking for a matching ${this.quoteChar}`,
      );
    }
  }

  /**
   * Checks if the provided `char` is valid for continued processing of the current token.
   *
   * @param char the character to check
   * @private
   * @return `true` if the character provided is valid, false otherwise
   */
  private isValidChar(char: string | undefined): boolean {
    return char !== undefined && char !== this.quoteChar;
  }
}
