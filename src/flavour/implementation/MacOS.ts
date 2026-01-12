import { Flavour, TextContent } from "../flavour.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import { HOSTNAME } from "../../constant/system.ts";
import { isEqual } from "lodash-es";

const MACOS: Flavour = {
  getInitialPrompt(): TextContent {
    return {
      value: `Last login: ${getCurrentDatetimeString()} on console`,
      isHTML: false,
    };
  },

  getPrompt(path: string[]): TextContent {
    const homeDirectory = FileSystemUtil.getHomeDirectory();

    let pathSegment: string;
    if (path.length === 0) {
      pathSegment = "/";
    } else if (isEqual(path, homeDirectory)) {
      pathSegment = "~";
    } else {
      pathSegment = path.at(-1)!;
    }

    return {
      value: `${FileSystemUtil.username}@${HOSTNAME} ${pathSegment} % `,
      isHTML: false,
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default MACOS;

/**
 * @returns the current date-time as a String, e.g. `Thu Jan  8 18:51:13`
 */
function getCurrentDatetimeString(): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date: Date = new Date();

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, " ");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${dayName} ${monthName} ${day} ${hours}:${minutes}:${seconds}`;
}
