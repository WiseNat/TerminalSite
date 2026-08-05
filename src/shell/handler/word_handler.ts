import { Handler } from "./handler.ts";
import Lexer, { Token, TokenType } from "../lexer.ts";

export default class WordHandler implements Handler {
  public nextToken(lexer: Lexer, token: Token) {
    let lexeme: string = "";

    // TODO: migrate peeked char into var?
    while (this.isValidChar(lexer.peekChar(), lexer)) {
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

  private isValidChar(char: string | undefined, lexer: Lexer): boolean {
    // TODO: impl me!
    return char !== undefined && !lexer.isWhitespace(char);
  }
}
