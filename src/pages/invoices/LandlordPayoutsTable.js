import { formatCurrency } from "../../utils/format";

const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

export default function LandlordPayoutsTable({
  payouts = [],
  loading = false,
  page = 0,
  pageSize = 10,
  totalPages = 0,
  totalElements = 0,
  pageInfo = { from: 0, to: 0 },
  monthlyTotals = [],
  onPageFirst,
  onPagePrev,
  onPageNext,
  onPageLast,
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-xl border border-slate-100 shadow-sm">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-50">
            <tr>
              <Th className="sticky left-0 z-10 bg-slate-50">#</Th>
              <Th className="sticky left-12 z-10 bg-slate-50">Chủ nhà</Th>
              <Th className="min-w-[140px]">Số điện thoại</Th>
              {MONTH_LABELS.map((label) => (
                <Th key={label} className="min-w-[110px] text-right">
                  {label}
                </Th>
              ))}
              <Th className="min-w-[130px] text-right">Tổng năm</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={16} className="text-center text-slate-500">
                  Đang tải dữ liệu...
                </Td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <Td colSpan={16} className="text-center text-slate-500">
                  Chưa có dữ liệu chi trả cho năm này.
                </Td>
              </tr>
            ) : (
              payouts.map((item, index) => (
                <tr key={item.landlordId || `${item.landlordName}-${index}`} className="even:bg-amber-50/40">
                  <Td className="sticky left-0 z-[5] bg-white font-semibold text-slate-700">
                    {page * pageSize + index + 1}
                  </Td>
                  <Td className="sticky left-12 z-[5] bg-white font-medium text-slate-800">
                    <div className="max-w-[180px] truncate" title={item.landlordName}>
                      {item.landlordName || "Không rõ tên"}
                    </div>
                  </Td>
                  <Td className="text-slate-600">{item.landlordPhone || "-"}</Td>
                  {MONTH_LABELS.map((label, monthIdx) => {
                    const value = (item.monthlyPayouts || [])[monthIdx] || 0;
                    return (
                      <Td key={`${item.landlordId || item.landlordName}-${label}`} className="text-right font-medium text-slate-700">
                        {formatCurrency(value)}
                      </Td>
                    );
                  })}
                  <Td className="text-right font-semibold text-amber-700">
                    {formatCurrency(item.total || 0)}
                  </Td>
                </tr>
              ))
            )}

            {monthlyTotals.length ? (
              <tr className="bg-amber-100/70 font-semibold text-slate-800">
                <Td colSpan={3}>Tổng (trang hiện tại)</Td>
                {monthlyTotals.map((value, idx) => (
                  <Td key={`total-${idx}`} className="text-right">
                    {formatCurrency(value)}
                  </Td>
                ))}
                <Td className="text-right text-amber-800">
                  {formatCurrency(monthlyTotals.reduce((sum, value) => sum + value, 0))}
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Hiển thị {pageInfo.from} - {pageInfo.to} trong tổng số {totalElements} kết quả
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPageFirst}
            disabled={page <= 0}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            « Đầu
          </button>
          <button
            type="button"
            onClick={onPagePrev}
            disabled={page <= 0}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹ Trước
          </button>
          <span className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={onPageNext}
            disabled={page >= totalPages - 1}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp ›
          </button>
          <button
            type="button"
            onClick={onPageLast}
            disabled={page >= totalPages - 1}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cuối »
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      scope="col"
      className={`border-b border-slate-200 px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", colSpan }) {
  return (
    <td className={`border-b border-slate-100 px-4 py-3 text-sm ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}