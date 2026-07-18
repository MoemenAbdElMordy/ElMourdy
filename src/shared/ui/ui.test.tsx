// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Btn, Input2, Modal2, cn } from "./index";

afterEach(cleanup);

describe("shared UI", () => {
  it("merges conditional class names", () => {
    expect(cn("base", false, "active", undefined)).toBe("base active");
  });

  it("associates input labels and validation errors", () => {
    render(<Input2 label="البريد الإلكتروني" error="الحقل مطلوب" />);
    const input = screen.getByLabelText("البريد الإلكتروني");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("الحقل مطلوب");
  });

  it("respects disabled buttons", () => {
    const onClick = vi.fn();
    render(<Btn disabled onClick={onClick}>حفظ</Btn>);
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("closes a modal with Escape", () => {
    const onClose = vi.fn();
    render(<Modal2 open title="تعديل البيانات" onClose={onClose}><p>المحتوى</p></Modal2>);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("تعديل البيانات");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
