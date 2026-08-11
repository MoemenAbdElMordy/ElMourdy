// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { parseLocation, routeToPath } from "./hash-router";
import { canAccess, ROLE_DEFAULT } from "./policy";

describe("hash routing", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("opens the home page for an empty hash", () => {
    expect(parseLocation()).toEqual({ route: "home", params: {} });
  });

  it("parses route identifiers and parameters", () => {
    window.history.replaceState({}, "", "/student-detail/12");
    expect(parseLocation()).toEqual({ route: "student-detail", params: { studentId: 12 } });
  });

  it("uses the not-found route for unknown paths", () => {
    window.history.replaceState({}, "", "/missing-page");
    expect(parseLocation().route).toBe("not-found");
  });

  it("serializes nested lecture routes", () => {
    expect(routeToPath("chapters", { subjectId: 3, jumpToLectures: true })).toBe("/chapters/3/lectures");
  });

  it("uses the chapter identifier for lesson routes", () => {
    expect(routeToPath("lessons", { subjectId: 9, chapterId: 4 })).toBe("/lessons/4");
  });

  it("keeps old hash links working during migration", () => {
    window.history.replaceState({}, "", "/#about");
    expect(parseLocation().route).toBe("about");
  });
});

describe("role policy", () => {
  it("allows students to open student routes", () => {
    expect(canAccess("student", "student-dashboard")).toBe(true);
    expect(canAccess("student", "admin-dashboard")).toBe(false);
  });

  it("keeps stable default destinations for every role", () => {
    expect(ROLE_DEFAULT).toEqual({
      guest: "home",
      student: "student-dashboard",
      parent: "parent-dashboard",
      teacher: "admin-dashboard",
      assistant: "admin-dashboard",
    });
  });
});
