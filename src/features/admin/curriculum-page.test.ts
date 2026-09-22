import { describe, expect, it } from "vitest";
import { descendantIds } from "./curriculum-page";
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
