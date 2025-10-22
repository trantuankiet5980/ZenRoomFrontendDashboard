export default function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
    INACTIVE: "bg-slate-200 text-slate-700 border-slate-300",
    AVAILABLE: "bg-sky-100 text-sky-700 border-sky-200",
    UNAVAILABLE: "bg-slate-200 text-slate-700 border-slate-300",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    BANNED: "bg-rose-100 text-rose-700 border-rose-200",
    DELETED: "bg-slate-200 text-slate-600 border-slate-300",
    PENDING_DELETE: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const labelMap = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    INACTIVE: "Ngừng hiển thị",
    AVAILABLE: "Đang hoạt động",
    UNAVAILABLE: "Tạm dừng",
    ACTIVE: "Đang hoạt động",
    BANNED: "Đã cấm",
    DELETED: "Đã xoá",
    PENDING_DELETE: "Chờ xoá",
  };

  const cls = map[status] || "bg-slate-100 text-slate-700 border-slate-200";
  const label = labelMap[status] || status || "Không rõ";
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-[2px] text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
