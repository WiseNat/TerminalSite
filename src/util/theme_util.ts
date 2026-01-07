export default class ThemeUtil {
  private static readonly themeStorageKey = "theme";

  /**
   * Set up the Current Theme either with a session storage value if it
   * exists, or relies on the default CSS theme.
   */
  public static setup() {
    const theme = sessionStorage.getItem(this.themeStorageKey);

    if (theme === null) {
      console.info(
        "No theme found in session storage, relying on default theme in CSS",
      );
      return;
    }

    this.setTheme(theme);
  }

  /**
   * @returs list of all available Themes denoted by the `--themes` CSS property.
   */
  public static getThemes(): string[] {
    const styles = getComputedStyle(document.documentElement);
    const themes = styles.getPropertyValue("--themes").trim();

    return themes ? themes.split(/\s+/) : [];
  }

  /**
   * Sets the provided CSS `theme` if valid and stores it in session storage.
   * @param theme the theme name to use
   */
  public static setTheme(theme: string): void {
    const themes = this.getThemes();

    if (themes.includes(theme)) {
      document.documentElement.dataset.theme = theme;
      sessionStorage.setItem(this.themeStorageKey, theme);
    }
  }
}
