import { Page } from "@playwright/test";
import { expect } from "../../fixture";
import { OUTPUT_SELECTOR } from "../constant/generic.ts";
import {
  ENTRY_FIVE,
  ENTRY_FOUR,
  ENTRY_ONE,
  ENTRY_SIX,
  ENTRY_TWO,
  ENTRY_ZERO,
} from "../../../../src/constant/theme.ts";

export interface ColouredCounts {
  directory: number;
  executables: number;
  archives: number;
  graphics: number;
  audios: number;
  rubbish: number;
}

export function getColouredSpanLocator(colour: string): string {
  return `//span[contains(@style, "color: ${colour}")]`;
}

export function getBoldColouredSpanLocator(colour: string): string {
  return `//span[contains(@style, "color: ${colour}") and contains(@style, "font-weight: bold")]`;
}

function toVar(property: string) {
  if (!property.startsWith("--")) {
    property = `--${property}`;
  }

  return `var(${property})`;
}

export async function checkForColouredSpans(
  page: Page,
  colouredCounts: ColouredCounts,
) {
  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(toVar(ENTRY_FOUR))),
  ).toHaveCount(colouredCounts.directory);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(toVar(ENTRY_TWO))),
  ).toHaveCount(colouredCounts.executables);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(toVar(ENTRY_ONE))),
  ).toHaveCount(colouredCounts.archives);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(toVar(ENTRY_FIVE))),
  ).toHaveCount(colouredCounts.graphics);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getBoldColouredSpanLocator(toVar(ENTRY_SIX))),
  ).toHaveCount(colouredCounts.audios);

  await expect(
    page
      .locator(OUTPUT_SELECTOR)
      .locator(getColouredSpanLocator(toVar(ENTRY_ZERO))),
  ).toHaveCount(colouredCounts.rubbish);
}
