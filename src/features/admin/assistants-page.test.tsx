// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";

const mocks = vi.hoisted(() => ({ load: vi.fn(), create: vi.fn() }));
vi.mock("../../shared/admin/day5", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../shared/admin/day5")>(),
  loadAssistants: mocks.load,
  createAssistant: mocks.create,
}));

import { Day5AssistantsPage } from "./day5-pages";

beforeEach(() => {
  mocks.load.mockResolvedValue({ assistants: [], permission_keys: ["manage_content"], pagination: {
    current_page: 1, per_page: 20, total_count: 0, total_pages: 1, next_page: null, previous_page: null,
  } });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function fillForm(email = "Test@Example.com") {
  fireEvent.click(screen.getByRole("button", { name: "إضافة مساعد" }));
  fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: "مساعد تجريبي" } });
  fireEvent.change(screen.getByLabelText("الهاتف"), { target: { value: "٠١٠١٢٣٤٥٦٧٨" } });
  fireEvent.change(screen.getByLabelText("البريد الإلكتروني (اختياري)"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("كلمة المرور المؤقتة"), { target: { value: "Secret123!" } });
  fireEvent.click(screen.getByRole("button", { name: "حفظ" }));
}

describe("assistant creation", () => {
  it("sends normalized phone and email and closes after a successful create", async () => {
    mocks.create.mockResolvedValue({ assistant: { id: 100 } });
    render(<Day5AssistantsPage />);
    await fillForm();
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      name: "مساعد تجريبي", phone: "01012345678", email: "test@example.com",
      password: "Secret123!", password_confirmation: "Secret123!",
    })));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows an existing-email rejection beside email without claiming creation succeeded", async () => {
    mocks.create.mockRejectedValue(new ApiError("Email has already been taken", 422, "unprocessable_entity"));
    render(<Day5AssistantsPage />);
    await fillForm();
    expect(await screen.findByText(/البريد الإلكتروني مستخدم في حساب آخر/)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("البريد الإلكتروني (اختياري)")).toHaveAttribute("aria-invalid", "true");
  });

  it("sends null instead of a duplicate empty email when the optional field is blank", async () => {
    mocks.create.mockResolvedValue({ assistant: { id: 101 } });
    render(<Day5AssistantsPage />);
    await fillForm("");
    await waitFor(() => expect(mocks.create).toHaveBeenLastCalledWith(expect.objectContaining({ email: null })));
  });
});
