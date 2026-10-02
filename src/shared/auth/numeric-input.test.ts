import { describe, expect, it } from "vitest";
import { normalizeNumericInput } from "./numeric-input";

describe("numeric auth input", () => {
  it("normalizes ASCII, Arabic-Indic and Eastern Arabic-Indic digits", () => {
    expect(normalizeNumericInput("٠١0۱۲٣٤5٦٧٨٩", 11)).toBe("010123456789".slice(0, 11));
  });

  it("removes formatting while preserving leading zero and limits length", () => {
    expect(normalizeNumericInput("+٢٠ (١٠) ١٢٣٤٥٦٧٨٩", 11)).toBe("20101234567");
    expect(normalizeNumericInput("٠١٠ ١٢٣٤٥٦٧٨", 11)).toBe("01012345678");
  });
});
