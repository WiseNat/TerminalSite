export interface CommandScript {
  run(args: string[]): Promise<void>;
  autocomplete?(args: string[]): Promise<Suggestion[] | null>;
}

export type Suggestion = {
  visual: string;
  actual: string;
};