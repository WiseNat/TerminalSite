import { Flavour, TextContent } from "../flavour.ts";
import { ZERO_WIDTH_SPACE } from "../../constant/char.ts";

// TODO: unit test me!
const WINDOWS: Flavour = {
  getInitialPrompt(): TextContent {
    return {
      value:
        "Microsoft Windows [Version 10.0.18363.1379]" +
        "\n(c) 2019 Microsoft Corporation. All rights reserved." +
        `\n${ZERO_WIDTH_SPACE}`,
      isHTML: false,
    };
  },

  getPrompt(path: string[]): TextContent {
    const pathSeparator = "\\";

    return {
      value: `C:${pathSeparator}${path.join(pathSeparator)}>`,
      isHTML: false,
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default WINDOWS;
