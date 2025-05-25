// TODO: Import other TS files
import { paste } from "./event/paste.ts";

const terminal = document.getElementById("terminal");
terminal?.addEventListener("paste", paste);
