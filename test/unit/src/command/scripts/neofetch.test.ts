import { beforeEach, describe, expect, test, vi } from "vitest";
import NEOFETCH from "../../../../../src/command/scripts/neofetch.ts";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import { escapeRegExp } from "lodash-es";
import { mockExtractVisibleText } from "../../../helper/mocks.ts";

/**
 * @param text the text to check
 * @returns true if the text contains logo-related text, false otherwise
 */
function containsLogoText(text: string) {
  const regexes: RegExp[] = [
    /\$\$\$\$\$\$\$\$\$0-` {2} \+L%\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$/gm,
    /\$\$\$\$\$@q}iv8\$\$@\$\$\$\$\$\$\$-:::::::::::::;:v\$@\$\$\$\$/gm,
    /`\+--------------------_______________-----\+/gm,
  ];

  for (const regex of regexes) {
    if (text.search(regex) === -1) {
      return false;
    }
  }

  return true;
}

/**
 * @param text the text to check
 * @returns true if the text contains info-related text, false otherwise
 */
function containsInfoText(text: string) {
  const regexes: RegExp[] = [
    /nathanwise/gm,
    /------------/gm,
    /Host/gm,
    /Kernel/gm,
    /Uptime/gm,
    /Shell/gm,
    /Resolution/gm,
    /DE/gm,
    /DE/gm,
    /WM/gm,
    /Theme/gm,
    /Shell Flavour/gm,
    /Terminal/gm,
    /CPU/gm,
    /GPU/gm,
    /Memory/gm,
  ];

  for (const regex of regexes) {
    if (text.search(regex) === -1) {
      return false;
    }
  }

  return true;
}

describe("Neofetch", () => {
  // Spy
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);

  // Mock
  mockExtractVisibleText();
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/html_util");
  vi.mock("../../../../../src/util/time_util", () => ({
    default: {
      loadTime: 0,
    },
  }));
  vi.mock("../../../../../src/util/theme_util");
  vi.mock("../../../../../src/util/flavour_util");

  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("document", {
      body: { clientWidth: 1920, clientHeight: 1080 },
    });
    vi.stubGlobal("location", {
      hostname: "terminal-site",
    });
  });

  describe("run", async () => {
    describe("No flags", () => {
      test("given no flags, should output a logo and system information", async () => {
        // Arrange
        const args: string[] = [];

        // Act
        await NEOFETCH.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledOnce();
        const spyCalledWithArgs = appendRawOutput.mock.calls[0];
        expect(spyCalledWithArgs).toHaveLength(1);

        const spyCalledWithArg = spyCalledWithArgs[0];
        expect(containsInfoText(spyCalledWithArg)).toBeTruthy();
        expect(containsLogoText(spyCalledWithArg)).toBeTruthy();
      });
    });

    describe("off flag: --off", () => {
      test("given the off flag, should output just system information", async () => {
        // Arrange
        const args: string[] = ["--off"];

        // Act
        await NEOFETCH.run(args);

        // Assert
        expect(appendRawOutput).toHaveBeenCalledOnce();
        const spyCalledWithArgs = appendRawOutput.mock.calls[0];
        expect(spyCalledWithArgs).toHaveLength(1);

        const spyCalledWithArg = spyCalledWithArgs[0];
        expect(containsInfoText(spyCalledWithArg)).toBeTruthy();
        expect(containsLogoText(spyCalledWithArg)).toBeFalsy();
      });
    });

    ["-L", "--logo"].forEach((flag) => {
      describe(`logo flag: ${flag}`, () => {
        test("given the logo flag, should output just the logo", async () => {
          // Arrange
          const args: string[] = [flag];

          // Act
          await NEOFETCH.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledOnce();
          const spyCalledWithArgs = appendRawOutput.mock.calls[0];
          expect(spyCalledWithArgs).toHaveLength(1);

          const spyCalledWithArg = spyCalledWithArgs[0];
          expect(containsInfoText(spyCalledWithArg)).toBeFalsy();
          expect(containsLogoText(spyCalledWithArg)).toBeTruthy();
        });
      });
    });

    [["--off"], []].forEach((args) => {
      describe(`Show Info with args: '${args}'`, () => {
        [
          {
            type: "2 hours 6 minutes and 45 seconds",
            expected: "2 hours, 6 mins",
            now: 7605000,
          },
          {
            type: "1 hour 6 minutes and 45 seconds",
            expected: "1 hour, 6 mins",
            now: 4005000,
          },
          {
            type: "3 hours and 45 seconds",
            expected: "3 hours",
            now: 10845000,
          },
          {
            type: "6 minutes and 45 seconds",
            expected: "6 mins, 45 secs",
            now: 405000,
          },
          {
            type: "1 minute and 45 seconds",
            expected: "1 min, 45 secs",
            now: 105000,
          },
          {
            type: "6 minutes",
            expected: "6 mins",
            now: 360000,
          },
          {
            type: "45 seconds",
            expected: "45 secs",
            now: 45000,
          },
          {
            type: "1 second",
            expected: "1 sec",
            now: 1000,
          },
          {
            type: "0 seconds",
            expected: "0 secs",
            now: 0,
          },
        ].forEach(({ type, now, expected }) => {
          test(`given uptime is ${type}, should show '${expected}'`, async () => {
            // Arrange
            vi.spyOn(performance, "now").mockReturnValue(now);

            // Act
            await NEOFETCH.run(args);

            // Assert
            expect(appendRawOutput).toHaveBeenCalledOnce();
            const spyCalledWithArgs = appendRawOutput.mock.calls[0];
            expect(spyCalledWithArgs).toHaveLength(1);

            const spyCalledWithArg = spyCalledWithArgs[0];
            expect(
              spyCalledWithArg.search(
                new RegExp(`Uptime.*>: ${escapeRegExp(expected)}`, "g"),
              ),
            ).not.toEqual(-1);
          });
        });

        test("should show 1920x1080 for the resolution", async () => {
          // Act
          await NEOFETCH.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledOnce();
          const spyCalledWithArgs = appendRawOutput.mock.calls[0];
          expect(spyCalledWithArgs).toHaveLength(1);

          const spyCalledWithArg = spyCalledWithArgs[0];
          expect(
            spyCalledWithArg.search(/Resolution.*>: 1920x1080/gm),
          ).not.toEqual(-1);
        });

        test("given navigator.hardwareConcurrency exists, should show CPU cores", async () => {
          // Arrange
          vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);

          // Act
          await NEOFETCH.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledOnce();
          const spyCalledWithArgs = appendRawOutput.mock.calls[0];
          expect(spyCalledWithArgs).toHaveLength(1);

          const spyCalledWithArg = spyCalledWithArgs[0];
          expect(
            spyCalledWithArg.search(/CPU.*>: Unknown \(8\) @ \?GHz/gm),
          ).not.toEqual(-1);
        });

        test("given navigator.hardwareConcurrency does not exist, should show ? cores", async () => {
          // Arrange
          vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(
            // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
            undefined,
          );

          // Act
          await NEOFETCH.run(args);

          // Assert
          expect(appendRawOutput).toHaveBeenCalledOnce();
          const spyCalledWithArgs = appendRawOutput.mock.calls[0];
          expect(spyCalledWithArgs).toHaveLength(1);

          const spyCalledWithArg = spyCalledWithArgs[0];
          expect(
            spyCalledWithArg.search(/CPU.*>: Unknown \(\?\) @ \?GHz/gm),
          ).not.toEqual(-1);
        });

        [
          {
            type: "performance.memory does not exist and navigator.deviceMemory does not exist, should show ?B / ?B for memory usage",
            performanceMemory: undefined,
            navigatorDeviceMemory: undefined,
            expected: /Memory.*>: \?B \/ \?B/gm,
          },
          {
            type: "performance.memory exists and navigator.deviceMemory does not exist, should show 98B / 196B for memory usage",
            performanceMemory: {
              usedJSHeapSize: 100_000,
              totalJSHeapSize: 200_000,
              jsHeapSizeLimit: 300_000,
            },
            navigatorDeviceMemory: undefined,
            expected: /Memory.*>: 98B \/ 196B/gm,
          },
          {
            type: "performance.memory does not exist and navigator.deviceMemory exists, should show ?B / 123B for memory usage",
            performanceMemory: undefined,
            navigatorDeviceMemory: 123,
            expected: /Memory.*>: \?B \/ 123B/gm,
          },
          {
            type: "performance.memory exists and navigator.deviceMemory exists, should show 98B / 196B for memory usage",
            performanceMemory: {
              usedJSHeapSize: 100_000,
              totalJSHeapSize: 200_000,
              jsHeapSizeLimit: 300_000,
            },
            navigatorDeviceMemory: 123,
            expected: /Memory.*>: 98B \/ 196B/gm,
          },
        ].forEach(
          ({ type, performanceMemory, navigatorDeviceMemory, expected }) => {
            test(`given ${type}`, async () => {
              // Arrange
              if (performanceMemory !== undefined) {
                Object.defineProperty(performance, "memory", {
                  configurable: true,
                  get() {
                    return performanceMemory;
                  },
                });
              } else {
                // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
                delete performance["memory"];
              }

              if (navigatorDeviceMemory !== undefined) {
                Object.defineProperty(navigator, "deviceMemory", {
                  configurable: true,
                  get() {
                    return navigatorDeviceMemory;
                  },
                });
              } else {
                // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
                delete navigator["deviceMemory"];
              }

              // Act
              await NEOFETCH.run(args);

              // Assert
              expect(appendRawOutput).toHaveBeenCalledOnce();
              const spyCalledWithArgs = appendRawOutput.mock.calls[0];
              expect(spyCalledWithArgs).toHaveLength(1);

              const spyCalledWithArg = spyCalledWithArgs[0];
              // Pre-calculated byte sizes based on set performance.memory values
              expect(spyCalledWithArg.search(expected)).not.toEqual(-1);
            });
          },
        );
      });
    });
  });
});
