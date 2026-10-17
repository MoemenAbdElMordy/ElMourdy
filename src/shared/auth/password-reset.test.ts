// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { loadPendingPasswordReset } from "./password-reset";

afterEach(() => sessionStorage.clear());

it("discards a corrupted pending reset instead of crashing the recovery page", () => {
  sessionStorage.setItem("elmourdy-pending-password-reset", "{invalid-json");
  expect(loadPendingPasswordReset()).toBeNull();
  expect(sessionStorage.getItem("elmourdy-pending-password-reset")).toBeNull();
});

it("discards an incomplete pending reset", () => {
  sessionStorage.setItem("elmourdy-pending-password-reset", JSON.stringify({ passwordResetId: 1 }));
  expect(loadPendingPasswordReset()).toBeNull();
});
