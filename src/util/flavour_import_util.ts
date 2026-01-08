import ObjectUtil from "./object_util.ts";
import { Flavour } from "../flavour/flavour.ts";

const FLAVOURS: Record<string, { default: Flavour }> = import.meta.glob<{
  default: Flavour;
}>("./**/*.ts", {
  eager: true,
  base: "/src/flavour/implementation",
});

// Vite Glob imports with a base always have './' appended to the start of files found as per https://vite.dev/guide/features.html#base-path
ObjectUtil.removeKeyAffix(FLAVOURS, "./", ".ts");

export default class FlavourImportUtil {
  /**
   * @returns a list of all existing {@link Flavour}s.
   */
  // prettier-ignore
  public static getFlavours(): Record<string, { default: Flavour }> {
    return FLAVOURS;
  }
}
