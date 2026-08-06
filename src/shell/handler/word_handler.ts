import { Handler } from "./handler.ts";
import Lexer, { Token, TokenType } from "../lexer.ts";
import QuoteHandler from "./quote_handler.ts";

export default class WordHandler implements Handler {
  private readonly SINGLE_QUOTE: string = "'";
  private readonly DOUBLE_QUOTE: string = "\"";

  private singleQuoteHandler: QuoteHandler = new QuoteHandler(
    this.SINGLE_QUOTE,
  );
  private doubleQuoteHandler: QuoteHandler = new QuoteHandler(
    this.DOUBLE_QUOTE,
  );

  /**
   * Gets the next {@link TokenType.WORD} {@link Token}.
   *
   * @param lexer the {@link Lexer} to consume from
   * @param token the {@link Token} to write the result to
   */
  public nextToken(lexer: Lexer, token: Token) {
    let nextChar: string | undefined;

    while (this.isValidChar((nextChar = lexer.peekChar()))) {
      // TODO: handle escaped chars? - will come in as \ and <char> separately

      switch (nextChar) {
        case this.SINGLE_QUOTE:
          this.singleQuoteHandler.nextToken(lexer, token);
          break;
        // prettier-ignore
        case this.DOUBLE_QUOTE:
          this.doubleQuoteHandler.nextToken(lexer, token);
          break;
        default: {
          const char: string = lexer.nextChar()!;
          Lexer.appendTokenValue(token, char);
        }
      }
    }

    token.type = TokenType.WORD;
  }

  /**
   * Checks if the provided `char` is valid for continued processing of the current token.
   *
   * @param char the character to check
   * @private
   * @return `true` if the character provided is valid, false otherwise
   */
  private isValidChar(char: string | undefined): boolean {
    // TODO: escaped whitespace?..
    return char !== undefined && !Lexer.isWhitespace(char);
  }
}
