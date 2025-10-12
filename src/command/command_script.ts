import { HelpInformation } from "./scripts/help.ts";

export interface CommandScript {
  run(args: string[]): Promise<void>;
  autocomplete?(
    userInput: string,
    args: string[],
  ): Promise<Suggestion[] | null>;
  help(): HelpInformation | null;
}

export type Suggestion = {
  visual: string;
  actual: string;
};
