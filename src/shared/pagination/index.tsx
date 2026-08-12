export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  next_page: number | null;
  previous_page: number | null;
};

export const emptyPagination: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0,
  next_page: null,
  previous_page: null,
};

export function addPagination(params: URLSearchParams, page = 1, perPage = 20) {
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  return params;
}

export function PaginationControls({ pagination, onPageChange }: { pagination: PaginationMeta; onPageChange: (page: number) => void }) {
  if (pagination.total_pages <= 1) return null;

  return <nav aria-label="صفحات النتائج" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm">
    <span>عرض صفحة {pagination.current_page} من {pagination.total_pages} — إجمالي {pagination.total_count}</span>
    <div className="flex gap-2">
      <button type="button" disabled={!pagination.previous_page} onClick={() => pagination.previous_page && onPageChange(pagination.previous_page)} className="rounded-lg border border-border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">السابق</button>
      <button type="button" disabled={!pagination.next_page} onClick={() => pagination.next_page && onPageChange(pagination.next_page)} className="rounded-lg border border-border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">التالي</button>
    </div>
  </nav>;
}
