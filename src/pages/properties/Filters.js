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
    <div className="flex items-center gap-2 flex-wrap">
      <input
        value={kw}
        onChange={(e) => onKwChange(e.target.value)}
        placeholder="Tìm theo: tiêu đề, mô tả, tên toà, số phòng"
        className="w-96 max-w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
      />

      <select
        value={size}
        onChange={(e) => onSizeChange(Number(e.target.value))}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        title="Số dòng / trang"
      >
        {[5,10,20,50].map(n => <option key={n} value={n}>{n}/trang</option>)}
      </select>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onStatusChange(t.key)}
            className={`px-3 py-1.5 rounded-lg border text-sm
              ${status === t.key
                ? "bg-brandBtn text-slate-900 border-amber-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <label className="flex items-center gap-2">
          <span>Từ ngày</span>
          <input
            type="date"
            value={createdFrom || ""}
            onChange={(e) => onCreatedFromChange(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
            max={createdTo || undefined}
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Đến ngày</span>
          <input
            type="date"
            value={createdTo || ""}
            onChange={(e) => onCreatedToChange(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
            min={createdFrom || undefined}
          />
        </label>
      </div>
    </div>
  );
}
