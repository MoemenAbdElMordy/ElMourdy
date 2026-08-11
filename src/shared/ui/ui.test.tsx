// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
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

  it("keeps focus and scroll position while editing a controlled modal field", async () => {
    function ControlledModal() {
      const [value, setValue] = useState("");
      return (
        <Modal2 open title="تعديل المساعد" onClose={() => undefined}>
          <div style={{ height: 900 }}>
            <Input2 label="الحقل الأول" />
            <div style={{ marginTop: 700 }}>
              <Input2
                label="المسمى الوظيفي"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
          </div>
        </Modal2>
      );
    }

    render(<ControlledModal />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    const input = screen.getByLabelText("المسمى الوظيفي");
    const scrollContainer = input.closest("[class*='overflow-y-auto']") as HTMLElement;
    input.focus();
    scrollContainer.scrollTop = 240;

    fireEvent.change(input, { target: { value: "م" } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    expect(input).toHaveFocus();
    expect(scrollContainer.scrollTop).toBe(240);
  });
});
