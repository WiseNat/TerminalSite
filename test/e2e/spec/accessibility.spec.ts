import { expect, test } from "../fixture";
import AxeBuilder from "@axe-core/playwright";
import { INPUT_SELECTOR } from "../helper/constant/generic";
import { runCommand } from "../helper/util/terminal_util.ts";

test.describe("homepage", () => {
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }, testInfo) => {
    // Disabled rules:
    // - 'page-has-heading-one' - h1 is used by screen-readers to quickly skip to the main content, this is redundant for my site
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

test.describe("focus", () => {
  test("clicking anywhere on the web page focuses the terminal", async ({
    page,
  }) => {
    // Arrange
    const viewportSize = page.viewportSize();
    const maxWidth = viewportSize!.width - 1;
    const maxHeight = viewportSize!.height - 1;
    const minWidth = 0;
    const minHeight = 0;
    const corners = [
      { x: minWidth, y: minHeight, type: "Top Left" },
      { x: minWidth, y: maxHeight, type: "Bottom Left" },
      { x: maxWidth, y: minHeight, type: "Top Right" },
      { x: maxWidth, y: maxHeight, type: "Bottom Right" },
    ];

    // Act & Assert
    const input = page.locator(INPUT_SELECTOR);
    for (const corner of corners) {
      await page.mouse.click(corner.x, corner.y);
      await expect(
        input,
        `Page clicked in the ${corner.type} to have the terminal focussed`,
      ).toBeFocused();
    }
  });

  test("clicking on anchor elements opens in a new tab", async ({ page }) => {
    // Arrange
    const input = "cat ~/Projects/this/.external";

    // Act
    await runCommand(page, input);

    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.locator("a[target=\"_blank\"]").click(),
    ]);

    // Assert
    expect(newPage.url()).toBe("https://github.com/WiseNat/TerminalSite/");
  });
});
