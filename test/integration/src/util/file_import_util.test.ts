import { describe, expect, test } from "vitest";
import FileImportUtil from "../../../../src/util/file_import_util";
import path from "path";

describe("readFile", () => {
  test("should return null if file does not exist", async () => {
    // Arrange
    const input = "./" + path.join("bin", "fake_file.txt");

    // Act
    const result = await FileImportUtil.readFile(input);

    // Assert
    expect(result).toBeNull();
  });

  test("should return null for an existing .gitkeep file", async () => {
    // Arrange
    const input = "./" + path.join("media", ".gitkeep");

    // Act
    const result = await FileImportUtil.readFile(input);

    // Assert
    expect(result).toBeNull();
  });

  test("should return content for an existing file", async () => {
    // Arrange
    // Keep this up to date with "an" existing file path
    const input = "./" + path.join("home", "nathanwise", "help.txt");
    console.warn(input);

    // Act
    const result = await FileImportUtil.readFile(input);

    // Assert
    expect(result).not.toBeNull();
  });
});
