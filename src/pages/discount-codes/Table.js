import { DISCOUNT_STATUS_META } from "./constants";
import { formatCurrency, formatDate } from "../../utils/format";

const TYPE_LABELS = {
  FIXED: "Giảm cố định",
  PERCENT: "Giảm theo %",
};

export default function DiscountCodesTable({
  items = [],
  loading,
  page = 0,
  size = 10,
  totalPages = 0,
  totalElements = 0,
  pageInfo = { from: 0, to: 0 },
  updatingId,
  deletingId,
  onPageFirst,
  onPagePrev,
  onPageNext,
  onPageLast,
  onEdit,
  onDelete,
}) {
  const showEmpty = !loading && (!items || items.length === 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã giảm giá</th>
              <th className="px-4 py-3">Loại &amp; giá trị</th>
              <th className="px-4 py-3">Thời hạn</th>
              <th className="px-4 py-3">Số lần dùng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showEmpty && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không có mã giảm giá nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {items.map((item) => {
              const statusMeta = DISCOUNT_STATUS_META[item.status] || {
                label: item.status || "Không rõ",
                className:
                  "inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-[2px] text-xs font-semibold text-slate-600",
              };
              const isUpdating = updatingId === item.codeId;
              const isDeleting = deletingId === item.codeId;
              return (
                <tr key={item.codeId} className="hover:bg-amber-50/40">
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <div className="text-base font-semibold text-slate-800">{item.code || "—"}</div>
                      <div className="text-xs text-slate-500">{item.description || "—"}</div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    <div className="font-medium text-slate-700">{TYPE_LABELS[item.discountType] || item.discountType || "—"}</div>
                    <div className="text-xs text-slate-500">
                      {renderDiscountValue(item.discountType, item.discountValue)}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    <div>Bắt đầu: <span className="font-medium text-slate-700">{formatDate(item.validFrom)}</span></div>
                    <div>Kết thúc: <span className="font-medium text-slate-700">{formatDate(item.validTo)}</span></div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    <div>Đã dùng: <span className="font-medium text-slate-700">{item.usedCount ?? 0}</span></div>
                    <div>
                      Giới hạn: <span className="font-medium text-slate-700">{renderUsageLimit(item.usageLimit)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    <span className={statusMeta.className}>{statusMeta.label}</span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        disabled={isDeleting}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? "Đang cập nhật…" : "Cập nhật"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item)}
                        disabled={isUpdating}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Đang xoá…" : "Xoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
              Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> mã giảm giá
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
          <span className="text-sm font-medium text-slate-700">
            Trang <b>{totalPages === 0 ? 0 : page + 1}</b>/<b>{Math.max(totalPages, 1)}</b>
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={onPageNext}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau ›
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
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

function renderDiscountValue(type, value) {
  if (type === "PERCENT") {
    const percent = Number(value);
    if (Number.isNaN(percent)) return "—";
    return `${percent}%`;
  }

  return formatCurrency(value);
}

function renderUsageLimit(limit) {
  if (limit === null || limit === undefined) return "Không giới hạn";
  if (limit === 0) return "0";
  return String(limit);
}