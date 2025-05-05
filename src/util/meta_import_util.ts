import { CommandScript } from "../command/command_script.ts";

const commandFiles = import.meta.glob<{ default: CommandScript }>(
  "/src/command/scripts/*.ts",
  { eager: true },
);

export default function getCommandScripts(): Record<
  string,
  { default: CommandScript }
> {
  return commandFiles;
}
