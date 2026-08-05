import TokenisedCommand from "../dto/tokenised_command.ts";
import Lexer, { Token, TokenType } from "./lexer.ts";

export default class Parser {
  // TODO: JSDoc
  public static parse(lexer: Lexer): TokenisedCommand {
    const tokens: Token[] = this.getAllTokens(lexer);

    let name: string = "";
    const args: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.value !== undefined && token.value !== null) {
        if (i === 0) {
          name = token.value;
        } else {
          args.push(token.value);
        }
      }
    }

    return new TokenisedCommand(name, args);
  }

  // TODO: JSDoc
  private static getAllTokens(lexer: Lexer): Token[] {
    const tokens = [...lexer];
    const lastToken = tokens.at(-1);

    if (lastToken !== undefined && lastToken.type === TokenType.EOF) {
      tokens.pop();
    }

    return tokens;
  }
}
