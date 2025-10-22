import { DISCOUNT_STATUS_OPTIONS, PAGE_SIZE_OPTIONS } from "./constants";
import { formatDateInput } from "../../utils/format";

export default function DiscountCodeFilters({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  statuses = [],
  onStatusesChange,
  validFrom,
  validTo,
  onDateChange,
  size = 10,
  onSizeChange,
  onReset,
}) {
  const handleToggleStatus = (value) => {
    if (!onStatusesChange) return;
    if (!value) {
      onStatusesChange([]);
      return;
    }
    const next = statuses.includes(value)
      ? statuses.filter((item) => item !== value)
      : [...statuses, value];
    onStatusesChange(next);
  };

  const searchPlaceholder = "Tìm kiếm theo mã, mô tả";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchSubmit?.();
              }
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 pr-12 text-sm font-medium text-slate-600 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSearchSubmit?.()}
          className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleToggleStatus(null)}
          className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
            statuses.length === 0
              ? "border-amber-300 bg-amber-100 text-amber-800 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"
          }`}
        >
          Tất cả trạng thái
        </button>

        {DISCOUNT_STATUS_OPTIONS.map((option) => {
          const active = statuses.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleStatus(option.value)}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Từ ngày
          <input
            type="date"
            value={formatDateInput(validFrom)}
            onChange={(event) => onDateChange?.("validFrom", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Đến ngày
          <input
            type="date"
            value={formatDateInput(validTo)}
            onChange={(event) => onDateChange?.("validTo", event.target.value)}
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
            {PAGE_SIZE_OPTIONS.map((option) => (
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
    </div>
  );
}