import { Page } from "@playwright/test";
import { expect } from "../../fixture";
import { outputSelector } from "../constant/generic.ts";
import {
  BLACK,
  BLUE,
  CYAN,
  GREEN,
  MAGENTA,
  RED,
} from "../../../../src/constant/colour.ts";

export interface ColouredCounts {
  directory: number;
  executables: number;
  archives: number;
  graphics: number;
  audios: number;
  rubbish: number;
}

export function getColouredSpanLocator(colour: string): string {
  return `//span[contains(@style, "color: ${colour}") and contains(@style, "font-weight: bold")]`;
}

export async function checkForColouredSpans(
  page: Page,
  colouredCounts: ColouredCounts,
) {
  await expect(
    page.locator(outputSelector).locator(getColouredSpanLocator(BLUE)),
  ).toHaveCount(colouredCounts.directory);

  await expect(
    page.locator(outputSelector).locator(getColouredSpanLocator(GREEN)),
  ).toHaveCount(colouredCounts.executables);

  await expect(
    page.locator(outputSelector).locator(getColouredSpanLocator(RED)),
  ).toHaveCount(colouredCounts.archives);

  await expect(
    page.locator(outputSelector).locator(getColouredSpanLocator(MAGENTA)),
  ).toHaveCount(colouredCounts.graphics);

  await expect(
    page.locator(outputSelector).locator(getColouredSpanLocator(CYAN)),
  ).toHaveCount(colouredCounts.audios);

  await expect(
    page
      .locator(outputSelector)
      .locator(`//span[contains(@style, "color: ${BLACK}")]`),
  ).toHaveCount(colouredCounts.rubbish);
}
