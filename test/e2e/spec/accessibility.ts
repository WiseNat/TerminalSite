import { expect, test } from "../fixture";
import AxeBuilder from "@axe-core/playwright";

test.describe("homepage", () => {
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }, testInfo) => {
    // Disabled rules:
    // - 'page-has-heading-one' - h1 is used by screenreaders to quickly skip to the main content, this is redundant for my site
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one"])
      .analyze();

    await testInfo.attach("accessibility-scan-results", {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: "application/json",
    });

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have any automatically detectable WCAG A or AA violations", async ({
    page,
  }, testInfo) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach("accessibility-scan-results", {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: "application/json",
    });

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
