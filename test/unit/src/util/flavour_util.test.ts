import { beforeEach, describe, expect, test, vi } from "vitest";
import FlavourImportUtil from "../../../../src/util/flavour_import_util.ts";
import { Flavour } from "../../../../src/flavour/flavour.ts";
import FlavourUtil from "../../../../src/util/flavour_util.ts";
import TerminalUtil from "../../../../src/util/terminal_util.ts";

describe("FlavourUtil", () => {
  // Spy
  const setPromptPath = vi.spyOn(TerminalUtil, "setPromptPath");

  // Mock
  vi.mock("../../../../src/util/flavour_import_util");
  vi.mock("../../../../src/util/terminal_util");

  beforeEach(() => {
    FlavourUtil._resetCurrentShellFlavour();
  });

  describe("setCurrentShellFlavour", () => {
    test("should set the currentShellFlavour as the provided value", () => {
      // Arrange
      const flavour: Flavour = {
        getInitialPrompt: vi.fn(),
        getPrompt: () => {
          return {
            value: "",
            isHTML: false,
          };
        },
      };

      // Act
      FlavourUtil.setCurrentShellFlavour(flavour);

      // Assert
      const retrievedFlavour = FlavourUtil.getCurrentShellFlavour();
      expect(retrievedFlavour).toStrictEqual(flavour);
      expect(setPromptPath).toHaveBeenCalledOnce();
    });
  });

  describe("getShellFlavour", () => {
    test("should not return the flavour if given the filename of the flavour", async () => {
      // Arrange
      const mockFlavourFile: Flavour = {
        getInitialPrompt: vi.fn(),
        getPrompt: vi.fn(),
      };
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        test: { default: mockFlavourFile },
      });

      // Act
      const result = FlavourUtil.getShellFlavour("./test.ts");

      // Assert
      expect(result).toBeNull();
    });

    test("should return the flavour if it exists", async () => {
      // Arrange
      const mockFlavourFile: Flavour = {
        getInitialPrompt: vi.fn(),
        getPrompt: vi.fn(),
      };
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        test: { default: mockFlavourFile },
      });

      // Act
      const result = FlavourUtil.getShellFlavour("test");

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBe(mockFlavourFile);
    });

    test("should return undefined if flavour does not exist", async () => {
      // Arrange
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({});

      // Act
      const result = FlavourUtil.getShellFlavour("test");

      // Assert
      expect(result).toBeNull();
    });
  });
});
