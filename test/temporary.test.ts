import { expect, test } from "vitest";

// TODO: Delete me! This file exists to prevent initial build failures

function sum(a: number, b: number) {
  return a + b;
}

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
