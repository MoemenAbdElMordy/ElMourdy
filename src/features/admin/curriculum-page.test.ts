import { describe, expect, it } from "vitest";
import { descendantIds, scheduledLectureFields, toLocalPublishInput } from "./curriculum-page";
import type { CurriculumNode } from "../../shared/curriculum/api";

describe("اختيار مكان العنصر", () => {
  it("يسمح بفتح نقل محاضرة بلا عناصر فرعية", () => {
    const lecture = { id: 8, kind: "lecture", title: "محاضرة" } as CurriculumNode;
    expect(descendantIds(lecture)).toEqual([8]);
  });

  it("يمنع وضع المجلد داخل نفسه أو أحد أبنائه", () => {
    const folder = {
      id: 1,
      branch_id: 1,
      kind: "folder",
      title: "الأصل",
      position: 1,
      children: [{ id: 2, branch_id: 1, kind: "folder", title: "الفرع", position: 1, children: [] }],
    } satisfies CurriculumNode;
    expect(descendantIds(folder)).toEqual([1, 2]);
  });
});

describe("جدولة نشر المحاضرة", () => {
  it("تحفظ الموعد بتوقيت مطلق وتنقل المحاضرة من المسودة إلى النشر المجدول", () => {
    const local = "2026-10-01T19:30";
    expect(scheduledLectureFields(local)).toEqual({
      publish_at: new Date(local).toISOString(),
      status: "published",
    });
    expect(toLocalPublishInput(new Date(local).toISOString())).toBe(local);
  });

  it("إزالة الموعد تلغي الجدولة دون تغيير حالة النشر الحالية", () => {
    expect(scheduledLectureFields("")).toEqual({ publish_at: null });
  });

  it("تعديل محاضرة مخفية دون تغيير موعدها لا ينشرها بالخطأ", () => {
    const local = "2026-10-01T19:30";
    expect(scheduledLectureFields(local, false)).toEqual({ publish_at: new Date(local).toISOString() });
  });
});
