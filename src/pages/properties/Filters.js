const TABS = [
  { key: "",         label: "Tất cả" },
  { key: "PENDING",  label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Từ chối" }
];

export default function Filters({
  kw, onKwChange,
  size, onSizeChange,
  status, onStatusChange,
  createdFrom, createdTo,
  onCreatedFromChange, onCreatedToChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="grid gap-1">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-200/60">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.5 3a5.5 5.5 0 0 1 4.356 8.815l3.665 3.664a.75.75 0 1 1-1.06 1.06l-3.664-3.665A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clipRule="evenodd" />
              </svg>
              <input
                value={kw}
                onChange={(e) => onKwChange(e.target.value)}
                placeholder="Tiêu đề, mô tả, tên tòa nhà hoặc số phòng"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">Nhập từ khóa để lọc nhanh danh sách bài đăng.</span>
          </label>

          <label className="grid gap-1 text-sm text-slate-600 relative -top-4">
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-inner focus:border-amber-300 focus:ring-4 focus:ring-amber-200/60"
              title="Số dòng / trang"
            >
              {[5,10,20,50].map(n => <option key={n} value={n}>{n} dòng/trang</option>)}
            </select>
          </label>
        </div>

      <div className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lọc trạng thái bài đăng</span>
          <div className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => onStatusChange(t.key)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all
                  ${status === t.key
                    ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Từ ngày</span>
            <input
              type="date"
              value={createdFrom || ""}
              onChange={(e) => onCreatedFromChange(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-amber-300 focus:ring-4 focus:ring-amber-200/60"
              max={createdTo || undefined}
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đến ngày</span>
            <input
              type="date"
              value={createdTo || ""}
              onChange={(e) => onCreatedToChange(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-amber-300 focus:ring-4 focus:ring-amber-200/60"
              min={createdFrom || undefined}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
