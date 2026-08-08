import { useEffect, useMemo, useState } from "react";
import { Download, Key, Plus, Trash2, XCircle } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  loadAcademicYears,
  loadGrades,
  type AcademicYear,
  type Grade,
} from "../../shared/admin/day5";
import {
  createCodeBatch,
  deleteCode,
  disableCode,
  exportCodeBatch,
  loadCodeBatches,
  type ActivationCodeBatch,
} from "../../shared/activation-codes/api";
import { loadCurriculum, type Curriculum } from "../../shared/curriculum/api";
import {
  Badge2,
  Btn,
  Card2,
  Input2,
  Modal2,
  Select2,
  notify,
} from "../../shared/ui";

const gradeLabel = (grade: Grade) =>
  grade.level === 1
    ? "الصف الأول الثانوي"
    : grade.level === 2
      ? "الصف الثاني الثانوي"
      : "الصف الثالث الثانوي";
export function ConnectedActivationCodesPage() {
  const [batches, setBatches] = useState<ActivationCodeBatch[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tree, setTree] = useState<Curriculum | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: 10,
    expires_on: "",
    academic_year_id: 0,
    grade_id: 0,
    lesson_id: 0,
  });
  const lessons = useMemo(
    () =>
      tree?.branches.flatMap((branch) =>
        branch.chapters.flatMap((chapter) =>
          chapter.lessons.map((lesson) => ({
            id: lesson.id,
            label: `${branch.title} — ${chapter.title} — ${lesson.title}`,
          })),
        ),
      ) ?? [],
    [tree],
  );
  const selectedLessonId = form.lesson_id || lessons[0]?.id || 0;
  const refresh = () =>
    loadCodeBatches()
      .then((r) => setBatches(r.batches))
      .catch((error) =>
        notify(
          error instanceof ApiError ? error.message : "تعذر تحميل الأكواد",
          "error",
        ),
      );
  useEffect(() => {
    void refresh();
    Promise.all([loadAcademicYears(), loadGrades()]).then(([y, g]) => {
      setYears(y.academic_years);
      setGrades(g.grades);
      setForm((current) => ({
        ...current,
        academic_year_id:
          y.academic_years.find((item) => item.status === "active")?.id ?? 0,
        grade_id: g.grades[0]?.id ?? 0,
      }));
    });
  }, []);
  useEffect(() => {
    if (!form.academic_year_id || !form.grade_id) return;
    loadCurriculum({
      academicYearId: form.academic_year_id,
      gradeId: form.grade_id,
    }).then((r) => {
      setTree(r.curriculum);
      const first = r.curriculum.branches[0]?.chapters[0]?.lessons[0]?.id ?? 0;
      setForm((current) => ({ ...current, lesson_id: first }));
    });
  }, [form.academic_year_id, form.grade_id]);
  const create = async () => {
    try {
      await createCodeBatch({ ...form, lesson_id: selectedLessonId });
      setModal(false);
      await refresh();
      notify("تم إنشاء دفعة الأكواد", "success");
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر إنشاء الدفعة",
        "error",
      );
    }
  };
  const act = async (action: "disable" | "delete", id: number) => {
    try {
      if (action === "disable") await disableCode(id);
      else await deleteCode(id);
      await refresh();
      notify(
        action === "disable" ? "تم تعطيل الكود" : "تم حذف الكود",
        "success",
      );
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "تعذر تنفيذ العملية",
        "error",
      );
    }
  };
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-black">أكواد التفعيل</h1>
          <Btn onClick={() => setModal(true)}>
            <Plus size={15} /> دفعة جديدة
          </Btn>
        </div>
        <div className="space-y-4">
          {batches.map((batch) => (
            <Card2 key={batch.id}>
              <div className="flex justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-black">{batch.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {batch.lesson} — {batch.academic_year} — ينتهي{" "}
                    {batch.expires_on}
                  </p>
                </div>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => exportCodeBatch(batch.id)}
                >
                  <Download size={14} /> تصدير
                </Btn>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge2 variant="success">
                  {batch.counts.redeemed ?? 0} مستخدم
                </Badge2>
                <Badge2>{batch.counts.unused ?? 0} متاح</Badge2>
                <Badge2 variant="danger">
                  {batch.counts.disabled ?? 0} معطل
                </Badge2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {batch.codes.map((code) => (
                      <tr key={code.id} className="border-t border-border">
                        <td className="py-2 font-mono" dir="ltr">
                          {code.code}
                        </td>
                        <td>
                          <Badge2>
                            {code.status === "unused"
                              ? "متاح"
                              : code.status === "redeemed"
                                ? "مستخدم"
                                : code.status === "disabled"
                                  ? "معطل"
                                  : "محذوف"}
                          </Badge2>
                        </td>
                        <td>{code.redeemed_by ?? "—"}</td>
                        <td className="text-left">
                          {code.status === "unused" && (
                            <div className="flex justify-end gap-2">
                              <button
                                aria-label={`تعطيل ${code.code}`}
                                onClick={() => act("disable", code.id)}
                              >
                                <XCircle size={15} />
                              </button>
                              <button
                                aria-label={`حذف ${code.code}`}
                                onClick={() => act("delete", code.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card2>
          ))}
        </div>
        <Modal2
          open={modal}
          onClose={() => setModal(false)}
          title="إنشاء دفعة أكواد"
        >
          <div className="space-y-3">
            <Input2
              label="اسم الدفعة"
              value={form.name}
              onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            />
            <Input2
              label="عدد الأكواد"
              type="number"
              min="1"
              max="500"
              value={form.quantity}
              onChange={(e) =>
                setForm((v) => ({ ...v, quantity: Number(e.target.value) }))
              }
            />
        <Input2
          label="تاريخ الانتهاء"
          type="date"
          value={form.expires_on}
          onInput={(event: any) => {
            const value = event.currentTarget.value;
            setForm((current) => ({ ...current, expires_on: value }));
          }}
        />
            <Select2
              label="السنة"
              value={String(form.academic_year_id)}
              onChange={(e: any) =>
                setForm((v) => ({
                  ...v,
                  academic_year_id: Number(e.target.value),
                }))
              }
              options={years.map((y) => ({
                value: String(y.id),
                label: y.name,
              }))}
            />
            <Select2
              label="الصف"
              value={String(form.grade_id)}
              onChange={(e: any) =>
                setForm((v) => ({ ...v, grade_id: Number(e.target.value) }))
              }
              options={grades.map((g) => ({
                value: String(g.id),
                label: gradeLabel(g),
              }))}
            />
            <Select2
              label="الدرس"
              value={String(selectedLessonId)}
              onChange={(e: any) =>
                setForm((v) => ({ ...v, lesson_id: Number(e.target.value) }))
              }
              options={lessons.map((l) => ({
                value: String(l.id),
                label: l.label,
              }))}
            />
            <Btn
              className="w-full"
              disabled={!form.name || !form.expires_on || !selectedLessonId}
              onClick={create}
            >
              <Key size={15} /> إنشاء الأكواد
            </Btn>
          </div>
        </Modal2>
      </div>
    </div>
  );
}
