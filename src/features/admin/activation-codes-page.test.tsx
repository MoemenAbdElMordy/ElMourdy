// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const codes = vi.hoisted(() => ({ load: vi.fn(), create: vi.fn(), export: vi.fn() }));
vi.mock("../../shared/activation-codes/api", () => ({
  loadCodeBatches: codes.load,
  createCodeBatch: codes.create,
  exportCodeBatch: codes.export,
  disableCode: vi.fn(),
  deleteCode: vi.fn(),
}));

import { ConnectedActivationCodesPage } from "./activation-codes-page";

const pagination = { current_page: 1, per_page: 20, total_count: 0, total_pages: 0, next_page: null, previous_page: null };

beforeEach(() => {
  codes.load.mockReset().mockResolvedValue({ batches: [], pagination });
  codes.create.mockReset().mockResolvedValue({ generated_codes: ["ELM-TEST-CODE"] });
  codes.export.mockReset();
});
afterEach(cleanup);

describe("teacher code batch journey", () => {
  it("creates a generic batch with the requested quantity and expiration", async () => {
    render(<ConnectedActivationCodesPage />);
    fireEvent.click(screen.getByRole("button", { name: "دفعة جديدة" }));
    fireEvent.change(screen.getByLabelText("اسم الدفعة"), { target: { value: "دفعة اختبار" } });
    fireEvent.change(screen.getByLabelText("عدد الأكواد"), { target: { value: "3" } });
    fireEvent.input(screen.getByLabelText("تاريخ الانتهاء"), { target: { value: "2026-12-31" } });
    fireEvent.click(screen.getByRole("button", { name: "إنشاء الأكواد" }));

    await waitFor(() => expect(codes.create).toHaveBeenCalledWith({
      name: "دفعة اختبار", quantity: 3, expires_on: "2026-12-31",
    }));
    expect(codes.create).toHaveBeenCalledTimes(1);
  });
});
