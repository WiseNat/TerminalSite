import TokenisedCommand from "../dto/tokenised_command.ts";
import Lexer, { Token, TokenType } from "./lexer.ts";

export default class Parser {
  /**
   * Consumes all relevant tokens in the `lexer` and transforms the result into a {@link TokenisedCommand}.
   * <p>
   * If there are...
   * - 2 or more non-{@link TokenType.EOF} tokens in the `lexer`, both the `name` and `args` will be populated.
   * - 1 non-{@link TokenType.EOF} tokens in the `lexer`, `name` will be populated and `args` will be empty.
   * - 0 non-{@link TokenType.EOF} tokens in the `lexer`, `name` and `args` will both be empty.
   *
   * @param lexer a lexer to parse
   * @returns a populated {@link TokenisedCommand} with an empty name if the there are 0 non-{@link TokenType.EOF}
   * tokens in the `lexer` and an empty args array if there are 1 or 0 tokens non-{@link TokenType.EOF} in the `lexer`
   * @throws an error if the {@link Lexer} fails to retrieve tokens
   */
  public static parse(lexer: Lexer): TokenisedCommand {
    const tokens: Token[] = this.getAllTokens(lexer);

    let name: string = "";
    const args: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // TODO: "consume" quotes
      const value: string | undefined | null = this.getTokenValue(token);
      if (value === undefined || value === null) {
        continue;
      }

      if (i === 0) {
        name = value;
      } else {
        args.push(value);
      }
    }

    return new TokenisedCommand(name, args);
  }

  /**
   * Retrieves all non-{@link TokenType.EOF} tokens in the `lexer`
   *
   * @param lexer a lexer to parse
   * @private
   */
  private static getAllTokens(lexer: Lexer): Token[] {
    const tokens = [...lexer];
    const lastToken = tokens.at(-1);

    if (lastToken !== undefined && lastToken.type === TokenType.EOF) {
      tokens.pop();
    }

    return tokens;
  }

  /**
   * Converts {@link Token} values into parser friendly values.
   * @param token
   * @private
   */
  private static getTokenValue(token: Token): string | null | undefined {
    if (token.type === TokenType.TRAILING_WHITESPACE) {
      return "";
    }

    return token.value;
  }
}
