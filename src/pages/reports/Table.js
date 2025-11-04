import { formatTimeFirstDate } from "../../utils/format";

function SortIndicator({ direction }) {
  return (
    <span className="ml-2 inline-flex flex-col text-[10px] leading-[10px] text-slate-400">
      <span className={direction === "ASC" ? "text-amber-500" : ""}>▲</span>
      <span className={`-mt-1 ${direction === "DESC" ? "text-amber-500" : ""}`}>▼</span>
    </span>
  );
}

export default function ReportsTable({
  reports = [],
  loading,
  page,
  totalPages,
  totalElements,
  pageInfo,
  sortDirection,
  onToggleSort,
  onPageFirst,
  onPagePrev,
  onPageNext,
  onPageLast,
}) {
  const showEmpty = !loading && (!reports || reports.length === 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Bài đăng</th>
              <th className="px-4 py-3">Người báo cáo</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={onToggleSort}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-amber-500"
                >
                  Ngày báo cáo
                  <SortIndicator direction={sortDirection} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showEmpty && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                  Chưa có báo cáo nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {reports.map((report) => (
              <tr key={report.reportId} className="hover:bg-amber-50/40">
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="font-semibold text-slate-800">{report.propertyTitle || "Không rõ"}</div>
                    <div className="text-xs text-slate-400">ID: {report.propertyId}</div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="font-semibold text-slate-800">{report.reporterName || "Không rõ"}</div>
                    <div className="text-xs text-slate-400">ID: {report.reporterId}</div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-700">{report.reason || "—"}</td>
                <td className="px-4 py-3 align-top text-sm text-slate-600">{report.description || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 align-top text-sm text-slate-600">{formatTimeFirstDate(report.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-500">
          Đang tải dữ liệu, vui lòng chờ giây lát…
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          {totalElements > 0 ? (
            <>
              Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> báo cáo
            </>
          ) : (
            <>Không có dữ liệu</>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 0}
            onClick={onPageFirst}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            « Đầu
          </button>
          <button
            type="button"
            disabled={page <= 0}
            onClick={onPagePrev}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹ Trước
          </button>
          <div className="text-xs text-slate-500">
            Trang <b>{totalPages === 0 ? 0 : page + 1}</b> / <b>{totalPages}</b>
          </div>
          <button
            type="button"
            disabled={page >= totalPages - 1 || totalPages === 0}
            onClick={onPageNext}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau ›
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1 || totalPages === 0}
            onClick={onPageLast}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cuối »
          </button>
        </div>
      </div>
    </div>
  );
}