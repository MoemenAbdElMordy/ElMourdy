// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redeemCode = vi.fn();
vi.mock("../../shared/activation-codes/api", () => ({ redeemCode: (...args: unknown[]) => redeemCode(...args) }));
import { ConnectedActivationPage } from "./activation-page";

beforeEach(() => redeemCode.mockReset());
afterEach(cleanup);

describe("student lecture activation", () => {
  it("requires a selected lecture before accepting a code", () => {
    const nav = vi.fn();
    render(<ConnectedActivationPage nav={nav} params={{}}/>);
    expect(screen.queryByLabelText("كود المحاضرة")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "افتح المنهج واختر المحاضرة" }));
    expect(nav).toHaveBeenCalledWith("subjects");
    expect(redeemCode).not.toHaveBeenCalled();
  });

  it("redeems exactly the selected lecture and opens it on success", async () => {
    redeemCode.mockResolvedValue({ access_grant: { id: 4, lecture_id: 35, lecture: "محاضرة اختبار", status: "active" } });
    const nav = vi.fn();
    render(<ConnectedActivationPage nav={nav} params={{ lectureId: 35 }}/>);
    fireEvent.change(screen.getByLabelText("كود المحاضرة"), { target: { value: "ab12cd" } });
    fireEvent.click(screen.getByRole("button", { name: "استخدام الكود وفتح المحاضرة" }));
    await waitFor(() => expect(redeemCode).toHaveBeenCalledWith("AB12CD", 35));
    fireEvent.click(await screen.findByRole("button", { name: "ابدأ مشاهدة المحاضرة" }));
    expect(nav).toHaveBeenCalledWith("video", { lessonId: 35 });
  });
});
