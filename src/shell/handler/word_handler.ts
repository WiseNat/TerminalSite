import { Handler } from "./handler.ts";
import Lexer, { Token, TokenType } from "../lexer.ts";

export default class WordHandler implements Handler {
  /**
   * Gets the next {@link TokenType.WORD} {@link Token}.
   *
   * @param lexer the {@link Lexer} to consume from
   * @param token the {@link Token} to write the result to
   */
  public nextToken(lexer: Lexer, token: Token) {
    let lexeme: string = "";

    // TODO: migrate peeked char into var?
    while (this.isValidChar(lexer.peekChar())) {
      //        foo 'ba'r 'baz gaz' 'daz'\'
      // WORD   XXXX    XX         X     XX
      // QUOTE      XXXX  XXXXXXXXX XXXXX

      // TODO: pass to other handlers based on peeked char?

      const char: string = lexer.nextChar()!;
      lexeme += char;
    }

    token.type = TokenType.WORD;
    token.value = lexeme;
  }

  /**
   * Checks if the provided `char` is valid for the {@link WordHandler}.
   *
   * @param char the character to check
   * @private
   * @return `true` if the character provided is valid for the {@link WordHandler} to process, false otherwise
   */
  private isValidChar(char: string | undefined): boolean {
    return char !== undefined && !Lexer.isWhitespace(char);
  }
}
