import { INVOICE_STATUS_OPTIONS } from "./constants";
import { formatDateInput } from "../../utils/format";

const PAGE_SIZES = [10, 20, 50, 100];

export default function InvoiceFilters({
  status = "ALL",
  fromDate,
  toDate,
  size = 20,
  dateError,
  onStatusChange,
  onDateChange,
  onSizeChange,
  onReset,
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {INVOICE_STATUS_OPTIONS.map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange?.(option.value)}
              className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                active
                  ? "border-amber-300 bg-amber-100 text-amber-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Từ ngày
          <input
            type="date"
            value={formatDateInput(fromDate)}
            onChange={(event) => onDateChange?.("fromDate", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Đến ngày
          <input
            type="date"
            value={formatDateInput(toDate)}
            onChange={(event) => onDateChange?.("toDate", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Số bản ghi mỗi trang
          <select
            value={size}
            onChange={(event) => onSizeChange?.(Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option} bản ghi
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thiết lập</span>
          <button
            type="button"
            onClick={() => onReset?.()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {dateError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {dateError}
        </div>
      ) : null}
    </div>
  );
}