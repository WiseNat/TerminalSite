import { MOBILE_PROJECTS } from "../constant/project.ts";
import { TestInfo } from "@playwright/test";

/**
 * @param testInfo the Playwright {@link TestInfo}.
 * @returns true if the Project running is a Mobile Project, false otherwise.
 */
export function isMobileProject(testInfo: TestInfo): boolean {
  return MOBILE_PROJECTS.includes(testInfo.project.name);
}

/**
 * Converts Hex to RGB.
 * @param hex a hex string (can start with a `#`)
 */
export function convertHexToRGB(hex: string) {
  // Remove the '#' if it's included in the input
  hex = hex.replace(/^#/, "");

  // Parse the hex values into separate R, G, and B values
  const red = Number.parseInt(hex.substring(0, 2), 16);
  const green = Number.parseInt(hex.substring(2, 4), 16);
  const blue = Number.parseInt(hex.substring(4, 6), 16);

  // Return the RGB values in an object
  return {
    red: red,
    green: green,
    blue: blue,
  };
}

/**
 * Converts Hex to a CSS RGBA String.
 * @see convertHexToRGB
 */
export function convertHexToRGBACSS(hex: string): string {
  const rgb = convertHexToRGB(hex);
  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0)`;
}

/**
 * Converts Hex to a CSS RGB String.
 * @see convertHexToRGB
 */
export function convertHexToRGBCSS(hex: string): string {
  const rgb = convertHexToRGB(hex);
  return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
}
