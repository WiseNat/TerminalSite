import { MOBILE_PROJECTS } from "../constant/project.ts";
import { TestInfo } from "@playwright/test";

/**
 * @param testInfo the Playwright {@link TestInfo}.
 * @returns true if the Project running is a Mobile Project, false otherwise.
 */
export function isMobileProject(testInfo: TestInfo): boolean {
  return MOBILE_PROJECTS.includes(testInfo.project.name);
}
