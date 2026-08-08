import Lexer, { Token } from "./lexer.ts";

export type AstNode = {
  readonly type: string;
};

export interface SimpleCommand extends AstNode {
  readonly type: "SimpleCommand";
  readonly words: Token[];
}

export type CommandNode = SimpleCommand;

export default class Parser {
  /**
   * Consumes all tokens available in the `lexer` and transforms them into a {@link CommandNode}.
   * <p>
   * Due to limitations with the overall shell architecture, this will only ever return a single node in the form of a
   * {@link SimpleCommand}.
   *
   * @param lexer
   */
  public static parse(lexer: Lexer): CommandNode {
    const tokens = [...lexer];

    // We only form a single node AST as of now as we do not support more complex operations (e.g. pipelines, redirections)
    return {
      type: "SimpleCommand",
      words: tokens,
    };
  }
}
