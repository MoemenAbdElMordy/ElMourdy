// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { parseHash, routeToHash } from "./hash-router";
import { canAccess, ROLE_DEFAULT } from "./policy";

describe("hash routing", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("opens the home page for an empty hash", () => {
    expect(parseHash()).toEqual({ route: "home", params: {} });
  });

  it("parses route identifiers and parameters", () => {
    window.location.hash = "#student-detail/12";
    expect(parseHash()).toEqual({ route: "student-detail", params: { studentId: 12 } });
  });

  it("uses the not-found route for unknown paths", () => {
    window.location.hash = "#missing-page";
    expect(parseHash().route).toBe("not-found");
  });

  it("serializes nested lecture routes", () => {
    expect(routeToHash("chapters", { subjectId: 3, jumpToLectures: true })).toBe("chapters/3/lectures");
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
