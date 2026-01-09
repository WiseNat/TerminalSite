import { Page } from "@playwright/test";
import { expect } from "../../fixture";
import { OUTPUT_SELECTOR } from "../constant/generic.ts";
import {
  ENTRY_FIVE_FOREGROUND_CLASS,
  ENTRY_FOUR_FOREGROUND_CLASS,
  ENTRY_ONE_FOREGROUND_CLASS,
  ENTRY_SIX_FOREGROUND_CLASS,
  ENTRY_TWO_FOREGROUND_CLASS,
  ENTRY_ZERO_FOREGROUND_CLASS,
} from "../../../../src/constant/theme.ts";

export interface ColouredCounts {
  directory: number;
  executables: number;
  archives: number;
  graphics: number;
  audios: number;
  rubbish: number;
}

export function getColouredSpanLocator(className: string): string {
  return `//span[@class="${className}"]`;
}

export function getBoldColouredSpanLocator(className: string): string {
  return `//span[@class="${className}" and contains(@style, "font-weight: bold")]`;
}

export async function checkForColouredSpans(
  page: Page,
  colouredCounts: ColouredCounts,
) {
  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(ENTRY_FOUR_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.directory);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(ENTRY_TWO_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.executables);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(ENTRY_ONE_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.archives);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(ENTRY_FIVE_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.graphics);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(ENTRY_SIX_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.audios);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getColouredSpanLocator(ENTRY_ZERO_FOREGROUND_CLASS)),
  ).toHaveCount(colouredCounts.rubbish);
}
