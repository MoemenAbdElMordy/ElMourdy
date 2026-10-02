import { useEffect, useState } from "react";
import { WorkspaceHeading } from '../dashboard/workspace-views';
import { arabicNumber as n } from '../../shared/arabic';
import { Download, Key, Plus, Trash2, XCircle } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  createCodeBatch,
  deleteCode,
  disableCode,
  exportCodeBatch,
  loadCodeBatches,
  type ActivationCodeBatch,
} from "../../shared/activation-codes/api";
import { emptyPagination, PaginationControls, type PaginationMeta } from "../../shared/pagination";
import {
  Badge2,
  Btn,
  Card2,
  Input2,
  Modal2,
  notify,
} from "../../shared/ui";

export function ConnectedActivationCodesPage() {
  const [batches, setBatches] = useState<ActivationCodeBatch[]>([]);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [form, setForm] = useState({
    name: "",
    quantity: 10,
    expires_on: "",
  });
  const refresh = () =>
    loadCodeBatches(page)
      .then((r) => { setBatches(r.batches); setPagination(r.pagination); })
      .catch((error) =>
        notify(
          error instanceof ApiError ? error.message : "تعذر تحميل الأكواد",
          "error",
        ),
      );
  useEffect(() => {
    void refresh();
  }, [page]);
  const create = async () => {
    try {
      await createCodeBatch(form);
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
    <div className="workspace code-workspace">
      <div className="max-w-6xl mx-auto">
        <WorkspaceHeading eyebrow="إدارة الوصول للمحتوى" title="كل دفعة، تحت السيطرة." description="أنشئ الأكواد وتابع استخدامها، واعرف المحاضرة والطالب المرتبطين بكل كود.">
          <Btn onClick={() => setModal(true)}>
            <Plus size={15} /> دفعة جديدة
          </Btn>
        </WorkspaceHeading>
        <section className="code-library-header"><div><h2>كود واحد. محاضرة يختارها الطالب.</h2><p>الأكواد الجديدة غير مرتبطة بمحاضرة بعينها. افتح أي دفعة لمراجعة حالة كل كود، أو صدّرها من مكان واحد.</p></div><Key/></section>
        <div className="space-y-4">
          {batches.map((batch,index) => (
            <details className="code-batch" key={batch.id} open={index===0}>
              <summary><span>{n(index+1)}</span><div><h2>{batch.name}</h2><p>{batch.generic?'صالحة لأي محاضرة مدفوعة':batch.lesson}</p></div><strong>عرض الأكواد</strong></summary>
              <div className="batch-body"><div className="batch-toolbar">
                <div>
                  <strong>تفاصيل الدفعة</strong>
                  <p className="text-xs text-muted-foreground">
                    {batch.generic ? "صالحة لأي محاضرة مدفوعة" : batch.lesson} — تنتهي {batch.expires_on}
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
                        <td>{code.redeemed_lecture ?? "—"}</td>
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
              </div>
            </details>
          ))}
        </div>
        {batches.length===0&&<Card2><p className="workspace-muted">لا توجد دفعات أكواد بعد. ابدأ بإنشاء أول دفعة.</p></Card2>}
        <PaginationControls pagination={pagination} onPageChange={setPage} />
        <Modal2
          open={modal}
          onClose={() => setModal(false)}
          title="إنشاء دفعة أكواد"
          onSubmit={create}
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
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
              الأكواد غير مرتبطة بصف أو محاضرة عند إنشائها. كل كود يُستخدم مرة واحدة لفتح محاضرة مدفوعة يختارها الطالب من منهجه.
            </div>
            <Btn
              type="submit"
              className="w-full"
              disabled={!form.name || !form.expires_on || form.quantity < 1}
            >
              <Key size={15} /> إنشاء الأكواد
            </Btn>
          </div>
        </Modal2>
      </div>
    </div>
  );
}
