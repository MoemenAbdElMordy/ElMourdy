import { describe, expect, it } from "vitest";
import { assessmentScope, watchPercent, watchStatus, watchTime } from "./student-progress";

describe("student progress presentation", () => {
  it("classifies the exact 20% and 75% boundaries", () => {
    expect(watchStatus(0)).toBe("not_watched");
    expect(watchStatus(19.9)).toBe("not_watched");
    expect(watchStatus(20)).toBe("partial");
    expect(watchStatus(74.9)).toBe("partial");
    expect(watchStatus(75)).toBe("watched");
  });

  it("shows the precise stop point in Arabic without dropping seconds", () => {
    expect(watchTime(65)).toBe("١:٠٥");
    expect(watchTime(0)).toBe("٠:٠٠");
    expect(watchTime(Number.NaN)).toBe("٠:٠٠");
  });

  it("clamps inconsistent progress and translates server scope", () => {
    expect(watchPercent(123)).toBe("١٠٠٪");
    expect(watchPercent(-2)).toBe("٠٪");
    expect(assessmentScope("Comprehensive")).toBe("شامل");
  });
});
