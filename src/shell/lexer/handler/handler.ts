import Lexer from "../lexer.ts";
import { Token } from "../../common.ts";

export interface Handler {
  nextToken(lexer: Lexer, token: Token): void;
}
