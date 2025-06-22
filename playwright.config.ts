import { defineConfig, devices } from "@playwright/test";

/**
 * Useful links:
 * - https://playwright.dev/docs/test-configuration
 * - https://playwright.dev/docs/api/class-testconfig
 */

const serverUrl = "http://localhost:5173";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,

  /* https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],

  /* CI Specific Configuration */
  forbidOnly: !!process.env.CI, // Instances of test.only in sourcecode fails build on CI
  retries: process.env.CI ? 2 : 0, // Retry on CI only
  workers: process.env.CI ? 1 : undefined, // No parallel tests in CI

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: serverUrl,
    headless: true,
    trace: "on-first-retry",
  },

  /*
    Microsoft Edge and Chrome (channels) are unsupported on Linux Distros that aren't explicitly Ubuntu or Debian.
    Comment out the following in the `node_modules/playwright-core/reinstall_<browser>_stable_linux.sh` scripts to force installation:

    if [ -z "$PLAYWRIGHT_HOST_PLATFORM_OVERRIDE" ]; then
      if [[ ! -f "/etc/os-release" ]]; then
        echo "ERROR: cannot install on unknown linux distribution (/etc/os-release is missing)"
        exit 1
      fi

      ID=$(bash -c 'source /etc/os-release && echo $ID')
      if [[ "${ID}" != "ubuntu" && "${ID}" != "debian" ]]; then
        echo "ERROR: cannot install on $ID distribution - only Ubuntu and Debian are supported"
        exit 1
      fi
    fi
  */
  projects: [
    /* Desktop */
    {
      name: "Chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "WebKit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Mobile */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: serverUrl,
    reuseExistingServer: !process.env.CI,
  },
});
