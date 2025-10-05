import {
  expect as baseExpect,
  ExpectMatcherUtils,
  Locator,
  MatcherReturnType,
  test as baseTest,
} from "@playwright/test";
import { escapeRegExp } from "lodash-es";

// Test
// eslint-disable-next-line @typescript-eslint/naming-convention
export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.goto("/");
    await use(page);
  },
});

// Expect
type MatcherError = {
  matcherResult: MatcherReturnType;
};

type MatcherRunnerOptions = {
  matcherName: string;
  locator: Locator;
  expected: string;
  regex: RegExp;
  isNot: boolean;
  utils: ExpectMatcherUtils;
  options?: { timeout?: number };
};

export async function runTextMatcher({
  matcherName,
  locator,
  expected,
  regex,
  isNot,
  utils,
  options,
}: MatcherRunnerOptions) {
  let pass: boolean;
  let matcherResult: MatcherReturnType | undefined;

  try {
    await baseExpect(locator).toHaveText(regex, options);
    pass = true;
  } catch (error: unknown) {
    matcherResult = (error as MatcherError).matcherResult;
    pass = false;
  }

  if (isNot) {
    pass = !pass;
  }

  const message = buildMessage(
    utils,
    isNot,
    matcherName,
    expected,
    matcherResult,
    locator,
  );

  return { pass, message };
}

function buildMessage(
  utils: ExpectMatcherUtils,
  isNot: boolean,
  matcherName: string,
  expected: string,
  matcherResult: MatcherReturnType | undefined,
  locator: Locator,
): () => string {
  const errorMessage = utils.matcherHint(matcherName, undefined, undefined, {
    isNot,
  });

  const expectedMessage = `${isNot ? "not" : ""}${utils.printExpected(expected)}`;

  const receivedMessage = matcherResult
    ? `Received: ${utils.printReceived(matcherResult.actual)}`
    : "";

  const locatorString = locator.toString(); // NOSONAR

  return () =>
    `${errorMessage}\n\nLocator: ${locatorString}\nExpected: ${expectedMessage}\n${receivedMessage}`;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const expect = baseExpect.extend({
  /**
   * Checks whether the given element contains the exact provided text.
   *
   * @param locator
   * @param expected
   * @param options
   */
  exactTextInElement: async function (
    locator: Locator,
    expected: string,
    options?: { timeout?: number },
  ) {
    return runTextMatcher({
      matcherName: "exactTextInElement",
      locator,
      expected,
      regex: new RegExp(`^\\u200B*${escapeRegExp(expected)}$`),
      isNot: this.isNot,
      utils: this.utils,
      options,
    });
  },

  /**
   * Checks whether the given element starts with the provided text.
   *
   * @param locator
   * @param expected
   * @param options
   */
  elementToStartWith: async function (
    locator: Locator,
    expected: string,
    options?: { timeout?: number },
  ) {
    return runTextMatcher({
      matcherName: "expectElementToStartWith",
      locator,
      expected,
      regex: new RegExp(`^\\u200B*${escapeRegExp(expected)}`),
      isNot: this.isNot,
      utils: this.utils,
      options,
    });
  },

  /**
   * Checks whether the given element ends with the provided text.
   *
   * @param locator
   * @param expected
   * @param options
   */
  elementToEndWith: async function (
    locator: Locator,
    expected: string,
    options?: { timeout?: number },
  ) {
    return runTextMatcher({
      matcherName: "expectElementToEndWith",
      locator,
      expected,
      regex: new RegExp(`\\u200B*${escapeRegExp(expected)}`),
      isNot: this.isNot,
      utils: this.utils,
      options,
    });
  },
});
