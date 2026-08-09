import { Handler } from "./handler.ts";
import Lexer, { Token, TokenPart, TokenPartType, TokenType } from "../lexer.ts";
import QuoteHandler from "./quote_handler.ts";

export default class WordHandler implements Handler {
  private readonly SINGLE_QUOTE: string = "'";
  private readonly DOUBLE_QUOTE: string = "\"";

  private singleQuoteHandler: QuoteHandler = new QuoteHandler(
    this.SINGLE_QUOTE,
    TokenPartType.SINGLE_QUOTED,
  );
  private doubleQuoteHandler: QuoteHandler = new QuoteHandler(
    this.DOUBLE_QUOTE,
    TokenPartType.DOUBLE_QUOTED,
  );

  /**
   * Gets the next {@link TokenType.WORD} {@link Token}.
   *
   * @param lexer the {@link Lexer} to consume from
   * @param token the {@link Token} to write the result to
   */
  public nextToken(lexer: Lexer, token: Token) {
    let nextChar: string | undefined;
    let tokenPart: TokenPart | undefined = undefined;

    while (this.isValidChar((nextChar = lexer.peekChar()))) {
      // TODO: handle escaped chars? - will come in as \ and <char> separately

      switch (nextChar) {
        case this.SINGLE_QUOTE:
          this.singleQuoteHandler.nextToken(lexer, token);
          tokenPart = undefined;
          break;
        case this.DOUBLE_QUOTE:
          this.doubleQuoteHandler.nextToken(lexer, token);
          tokenPart = undefined;
          break;
        default: {
          tokenPart = this.appendNextChar(lexer, token, tokenPart);
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

  /**
   * Appends the next literal character in the `lexer` to the `tokenPart`'s value.
   * <p>
   * If the `tokenPart` does not exist, a new one is created and appended to the `token`.
   *
   * @param lexer the {@link Lexer} to consume from
   * @param token the {@link Token} to write the result to
   * @param tokenPart the {@link TokenPart} to append the next character to, if undefined a new {@link TokenPart} is
   * created
   * @private
   */
  private appendNextChar(
    lexer: Lexer,
    token: Token,
    tokenPart: TokenPart | undefined,
  ): TokenPart {
    const char: string = lexer.nextChar()!;

    if (tokenPart === undefined) {
      tokenPart = {
        type: TokenPartType.LITERAL,
        value: char,
      };

      Lexer.appendPart(token, tokenPart);
      return tokenPart;
    } else {
      tokenPart.value += char;
      return tokenPart;
    }
  }
}
