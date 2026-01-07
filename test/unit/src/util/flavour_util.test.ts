import { beforeEach, describe, expect, test, vi } from "vitest";
import FlavourImportUtil from "../../../../src/util/flavour_import_util.ts";
import { Flavour } from "../../../../src/flavour/flavour.ts";
import FlavourUtil from "../../../../src/util/flavour_util.ts";
import TerminalUtil from "../../../../src/util/terminal_util.ts";
import UNIX from "../../../../src/flavour/implementation/Unix.ts";

describe("FlavourUtil", () => {
  // Spy
  const setPromptPath = vi.spyOn(TerminalUtil, "setPromptPath");
  const setRawOutput = vi.spyOn(TerminalUtil, "setRawOutput");
  const setOutput = vi.spyOn(TerminalUtil, "setOutput");
  const setCurrentShellFlavour = vi.spyOn(
    FlavourUtil,
    "setCurrentShellFlavour",
  );

  // Mock
  vi.mock("../../../../src/util/flavour_import_util");
  vi.mock("../../../../src/util/terminal_util");

  beforeEach(() => {
    FlavourUtil._resetCurrentShellFlavour();
  });

  describe("setup", () => {
    test("Given no stored flavour, should set the flavour as Unix", () => {
      vi.stubGlobal("sessionStorage", {
        getItem: () => null,
      });
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({});

      // Act
      FlavourUtil.setup();

      // Assert
      expect(setCurrentShellFlavour).toHaveBeenCalledExactlyOnceWith(UNIX);
    });

    test("Given a stored flavour that is valid and isHTML, should set the flavour as the stored value and set the raw output", () => {
      const mockFlavourFile: Flavour = {
        getInitialPrompt: () => {
          return { value: "", isHTML: true };
        },
        getPrompt: vi.fn(),
      };

      vi.stubGlobal("sessionStorage", {
        getItem: () => "test",
        setItem: () => {},
      });
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        test: { default: mockFlavourFile },
      });

      // Act
      FlavourUtil.setup();

      // Assert
      expect(setCurrentShellFlavour).toHaveBeenCalledExactlyOnceWith(
        mockFlavourFile,
      );
      expect(setRawOutput).toHaveBeenCalledOnce();
      expect(setOutput).not.toHaveBeenCalled();
    });

    test("Given a stored flavour that is not valid, should set the flavour as the stored value", () => {
      const mockFlavourFile: Flavour = {
        getInitialPrompt: () => {
          return { value: "", isHTML: false };
        },
        getPrompt: vi.fn(),
      };

      vi.stubGlobal("sessionStorage", {
        getItem: () => "test",
        setItem: () => {},
      });
      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        test: { default: mockFlavourFile },
      });

      // Act
      FlavourUtil.setup();

      // Assert
      expect(setCurrentShellFlavour).toHaveBeenCalledExactlyOnceWith(
        mockFlavourFile,
      );
      expect(setRawOutput).not.toHaveBeenCalled();
      expect(setOutput).toHaveBeenCalledOnce();
    });
  });

  describe("setCurrentShellFlavour", () => {
    test("should set the currentShellFlavour as the provided value and store it", () => {
      // Arrange
      const setItemSpy = vi.fn();
      vi.stubGlobal("sessionStorage", {
        setItem: setItemSpy,
      });

      const flavour: Flavour = {
        getInitialPrompt: vi.fn(),
        getPrompt: () => {
          return {
            value: "",
            isHTML: false,
          };
        },
      };

      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        foo: { default: flavour },
      });

      // Act
      FlavourUtil.setCurrentShellFlavour(flavour);

      // Assert
      const retrievedFlavour = FlavourUtil.getCurrentShellFlavour();
      expect(retrievedFlavour).toStrictEqual(flavour);
      expect(setPromptPath).toHaveBeenCalledOnce();
      expect(setItemSpy).toHaveBeenCalledExactlyOnceWith("flavour", "foo");
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

  describe("getShellFlavourName", () => {
    test("should return the flavour name if it exists", () => {
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

      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        foo: { default: flavour },
      });

      // Act
      const flavourName = FlavourUtil.getShellFlavourName(flavour);

      // Assert
      expect(flavourName).toEqual("foo");
    });

    test("should return null if the flavour does not exist", () => {
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

      vi.mocked(FlavourImportUtil.getFlavours).mockReturnValue({
        foo: { default: { getPrompt: vi.fn(), getInitialPrompt: vi.fn() } },
      });

      // Act
      const flavourName = FlavourUtil.getShellFlavourName(flavour);

      // Assert
      expect(flavourName).toBeNull();
    });
  });
});
