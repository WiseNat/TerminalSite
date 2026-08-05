import Lexer, { Token } from "../lexer.ts";

export interface Handler {
  nextToken(lexer: Lexer, token: Token): void;
}
