import StatusBadge from "../../components/StatusBadge";
import { resolveAvatarUrl } from "../../utils/cdn";

export default function PropertiesTable({
  items, loading,
  page, size, totalPages, totalElements, pageInfo,
  onPageFirst, onPagePrev, onPageNext, onPageLast,
  onView, onApprove, onReject, onDelete,
  actionLoadingId, highlightId,
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
      <div className="mt-1 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 px-3">Tiêu đề</th>
              <th className="py-2 px-3">Chủ nhà</th>
              <th className="py-2 px-3">Giá</th>
              <th className="py-2 px-3">Trạng thái</th>
              <th className="py-2 px-3">Tạo lúc</th>
              <th className="py-2 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Không có dữ liệu</td></tr>
            )}

            {items.map((p) => {
              const busy = actionLoadingId === p.propertyId;
              const isHL = highlightId === p.propertyId;
              return (
                <tr 
                  key={p.propertyId} 
                  data-rowid={p.propertyId}
                  className={`hover:bg-amber-50/40 ${isHL ? "ring-2 ring-amber-400 animate-pulse" : ""}`}>
                  <td className="py-2 px-3">
                    <div className="font-medium text-slate-800">{p.title || "(Không tiêu đề)"}</div>
                    <div className="text-xs text-slate-500">
                      {p.propertyType} · {p.area ?? "—"} m² · {p.capacity ?? "—"} người · P.{p.roomNumber ?? "—"}
                    </div>
                    {p.address?.addressFull && (
                      <div className="text-xs text-slate-500 truncate max-w-[360px]">
                        {p.address.addressFull}
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      {p.landlord?.avatarUrl ? (
                        <img
                          src={resolveAvatarUrl(p.landlord.avatarUrl)}
                          alt="ll"
                          className="h-8 w-8 rounded-full object-cover border"
                          onError={(e)=>{ e.currentTarget.style.display="none"; }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-amber-200 grid place-items-center text-xs font-semibold text-amber-900">
                          {(p.landlord?.fullName || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-800">{p.landlord?.fullName || "—"}</div>
                        <div className="text-xs text-slate-500">{p.landlord?.phoneNumber || p.landlord?.email || ""}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">{formatCurrency(p.price)}</td>
                  <td className="py-2 px-3"><StatusBadge status={p.postStatus} /></td>
                  <td className="py-2 px-3 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                  <td className="py-2 px-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onView(p.propertyId)}
                        className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50">Xem</button>

                      {p.postStatus === "PENDING" && (
                        <>
                          <button disabled={busy} onClick={() => onApprove(p)}
                            className="px-2 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:brightness-95 disabled:opacity-50">
                            {busy ? "..." : "Duyệt"}
                          </button>
                          <button disabled={busy} onClick={() => onReject(p)}
                            className="px-2 py-1.5 rounded-lg bg-rose-100 text-rose-800 hover:brightness-95 disabled:opacity-50">
                            Từ chối
                          </button>
                        </>
                      )}

                      <button disabled={busy} onClick={() => onDelete(p)}
                        className="px-2 py-1.5 rounded-lg border bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && <div className="p-4 text-sm text-slate-500">Đang tải…</div>}
      </div>

      {/* Footer: pagination */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-2">
        <div className="text-xs text-slate-500">
          Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> bản ghi
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 0} onClick={onPageFirst} className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">« Đầu</button>
          <button disabled={page <= 0} onClick={onPagePrev}  className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">‹ Trước</button>
          <span className="text-sm text-slate-600">Trang <b>{page + 1}</b>/<b>{Math.max(totalPages, 1)}</b></span>
          <button disabled={page + 1 >= totalPages} onClick={onPageNext} className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">Tiếp ›</button>
          <button disabled={page + 1 >= totalPages} onClick={onPageLast} className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">Cuối »</button>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(n) {
  if (n == null) return "—";
  try { return new Intl.NumberFormat("vi-VN",{ style:"currency", currency:"VND", maximumFractionDigits:0 }).format(n); }
  catch { return `${n}`; }
}
function formatDateTime(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("vi-VN");
}
