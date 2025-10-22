import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "BANNED", label: "Đã cấm" },
  { value: "PENDING_DELETE", label: "Chờ xoá" },
  { value: "DELETED", label: "Đã xoá" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "role", label: "Vai trò" },
  { value: "status", label: "Trạng thái" },
];

const PAGE_SIZES = [10, 20, 50, 100];

export default function UsersFilters({
  keyword,
  status,
  fromDate,
  toDate,
  sortBy,
  sortDirection,
  size,
  onKeywordChange,
  onStatusChange,
  onDateChange,
  onSortByChange,
  onSortDirectionChange,
  onSizeChange,
  onReset,
}) {
  const [localKeyword, setLocalKeyword] = useState(keyword || "");

  useEffect(() => {
    setLocalKeyword(keyword || "");
  }, [keyword]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onKeywordChange(localKeyword.trim());
  };

  const handleReset = () => {
    setLocalKeyword("");
    onReset();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={localKeyword}
            onChange={(event) => setLocalKeyword(event.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại hoặc vai trò…"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 013.97 9.37l3.58 3.58a.75.75 0 01-1.06 1.06l-3.58-3.58A5.5 5.5 0 119 3.5zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        <div className="flex gap-2 md:w-auto">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/70"
          >
            Xoá lọc
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Từ ngày
          <input
            type="datetime-local"
            value={fromDate || ""}
            onChange={(event) => onDateChange("fromDate", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Đến ngày
          <input
            type="datetime-local"
            value={toDate || ""}
            onChange={(event) => onDateChange("toDate", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sắp xếp theo
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Thứ tự
          <select
            value={sortDirection}
            onChange={(event) => onSortDirectionChange(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            <option value="DESC">Giảm dần</option>
            <option value="ASC">Tăng dần</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Kích thước trang
          <select
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option} bản ghi
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}