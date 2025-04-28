import { CommandScript } from "../command/command_script.ts";

const commandFiles: Record<string, () => Promise<CommandScript>> =
  import.meta.glob<CommandScript>("/src/command/scripts/*.ts");

export default function getCommandScripts(): Record<
  string,
  () => Promise<CommandScript>
> {
  return commandFiles;
}
