import { describe, expect, it } from "vitest";
import { assistantCanOpen } from "./assistant-permissions";

describe("assistant page permissions", () => {
  it("requires student-management permission for list and detailed follow-up", () => {
    expect(assistantCanOpen("students-list", [])).toBe(false);
    expect(assistantCanOpen("student-detail", [])).toBe(false);
    expect(assistantCanOpen("student-detail", ["manage_students"])).toBe(true);
  });

  it("separates homework, exam, and report permissions", () => {
    expect(assistantCanOpen("homework-manage", ["manage_homeworks"])).toBe(true);
    expect(assistantCanOpen("exam-manage", ["manage_homeworks"])).toBe(false);
    expect(assistantCanOpen("management-reports", ["manage_students"])).toBe(false);
    expect(assistantCanOpen("management-reports", ["view_reports"])).toBe(true);
  });
});
