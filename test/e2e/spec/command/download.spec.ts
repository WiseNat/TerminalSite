import { expect, test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";
import fs from "node:fs";

test.describe("Download", () => {
  const parentPath = "./test/e2e/content";

  [
    "/downloads/text_file.txt",
    "/downloads/no_extension",
    "/downloads/static.wav",
    "/downloads/old_site.pdf",
    "/downloads/functions.js",
    "/downloads/README.md",
    "/downloads/old_embed.png",
    "/downloads/rest.json",
    "/downloads/typed_functions.ts",
    "/downloads/external.svg",
    "/downloads/mandelbrot.webm",
    "/downloads/archive.tar.gz",
  ].forEach((path) => {
    test(`Should download a file with the exact same content when given the path ${path}`, async ({
      page,
    }) => {
      // Arrange
      const input = `download ${path}`;

      // Act
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        await runCommand(page, input),
      ]);

      // Assert
      await assertOutputInTerminal(page, input);

      const downloadedFilePath = await download.path();
      const actual = fs.readFileSync(downloadedFilePath, "binary");

      const expected = fs.readFileSync(`${parentPath}${path}`, "binary");

      expect(actual).toEqual(expected);
    });
  });

  test("Should output nothing when no args are passed", async ({ page }) => {
    // Arrange
    const input = "download";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, input);
  });

  [
    {
      type: "an unknown path",
      args: ["/some/fake/path"],
      expected: "download: /some/fake/path: No such file or directory",
    },
    {
      type: "a directory path",
      args: ["/src/main/nathanwise/Desktop"],
      expected: "download: /src/main/nathanwise/Desktop: Is a directory",
    },
    {
      type: "multiple paths",
      args: ["/src/main/index.ts", "/colour/archive.zip"],
      expected: "download: Too many paths",
    },
    {
      type: "multiple fake values",
      args: ["foo", "bar", "baz"],
      expected: "download: Too many paths",
    },
  ].forEach(({ type, args, expected }) => {
    test(`Should show an error when given ${type}`, async ({ page }) => {
      // Arrange
      let input = "download";
      if (args.length !== 0) {
        input += " " + args.join(" ");
      }

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });
});
