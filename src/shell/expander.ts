import { Token, TokenType } from "./lexer.ts";
import { AstNode, CommandNode, SimpleCommand } from "./parser.ts";

export type ExecutionCommandNode = ExecutionCommand;

export interface ExecutionCommand extends AstNode {
  readonly type: "ExecutionCommand";
  readonly name: string;
  readonly args: string[];
}

export default class Expander {
  /**
   * Converts a single {@link CommandNode} into an {@link ExecutionCommandNode}.
   *
   * @param commandNode
   * @throws Error if any {@link CommandNode} other than a {@link SimpleCommand} is provided
   */
  public static expand(commandNode: CommandNode): ExecutionCommandNode {
    if (commandNode.type !== "SimpleCommand") {
      throw new Error(`Unsupported Command Type '${commandNode.type}'`);
    }

    // Browsing the tree is not required as we currently can only ever have a single node
    return this.expandSimpleCommand(commandNode);
  }

  /**
   * Converts a {@link SimpleCommand} into an {@link ExecutionCommand}.
   * <p>
   * - 2 or more non-{@link TokenType.EOF} tokens in the `simpleCommand`, both the `name` and `args` will be populated.
   * - 1 non-{@link TokenType.EOF} tokens in the `simpleCommand`, `name` will be populated and `args` will be empty.
   * - 0 non-{@link TokenType.EOF} tokens in the `simpleCommand`, `name` and `args` will both be empty.
   * <p>
   * This will also 'consume' available quotes when converting tokens into the `name` and `args`.
   *
   * @param simpleCommand the {@link SimpleCommand} to expand & convert
   * @private
   */
  private static expandSimpleCommand(
    simpleCommand: SimpleCommand,
  ): ExecutionCommand {
    let name: string = "";
    const args: string[] = [];

    const tokens: Token[] = simpleCommand.words;

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

    return { type: "ExecutionCommand", name: name, args: args };
  }

  /**
   * Converts {@link Token} values into expander friendly values.
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
