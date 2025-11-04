import StatusBadge from "../../components/StatusBadge";
import { resolveAvatarUrl } from "../../utils/cdn";
import { formatTimeFirstDate } from "../../utils/format";

export default function PropertiesTable({
  items, loading,
  page, size, totalPages, totalElements, pageInfo,
  onPageFirst, onPagePrev, onPageNext, onPageLast,
  onView, onApprove, onReject, onDelete,
  actionLoadingId, highlightId,
}) {
  const showEmpty = !loading && items.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Thông tin bài đăng</th>
              <th className="px-4 py-3">Chủ nhà</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thời gian đăng bài</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showEmpty && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không có dữ liệu phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {items.map((p) => {
              const busy = actionLoadingId === p.propertyId;
              const isHL = highlightId === p.propertyId;
              return (
                <tr
                  key={p.propertyId} 
                  data-rowid={p.propertyId}
                  className={`${isHL ? "ring-2 ring-amber-400 animate-pulse" : "hover:bg-amber-50/40"}`}>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start gap-2">
                        <span className="rounded-lg bg-amber-100 px-2 py-[2px] text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                          {p.propertyType || "Không rõ"}
                        </span>
                        {p.buildingName && (
                          <span className="rounded-lg bg-slate-100 px-2 py-[2px] text-[11px] font-medium text-slate-600">
                            {p.buildingName}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-semibold text-slate-800">{p.title || "(Không tiêu đề)"}</div>
                      <div className="text-xs text-slate-500">
                        Diện tích: <b>{p.area ?? "—"} m²</b> · Sức chứa: <b>{p.capacity ?? "—"} người</b> · Phòng: <b>{p.roomNumber ?? "—"}</b> · Tầng: <b>{p.floorNo ?? "—"}</b>
                      </div>
                      {p.address?.addressFull && (
                        <div className="text-xs text-slate-500">
                          {p.address.addressFull}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      {p.landlord?.avatarUrl ? (
                        <img
                          src={resolveAvatarUrl(p.landlord.avatarUrl)}
                          alt={p.landlord?.fullName || "Chủ nhà"}
                          className="h-10 w-10 rounded-full border object-cover"
                          onError={(e)=>{ e.currentTarget.style.display="none"; }}
                        />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-200 text-sm font-semibold text-amber-900">
                          {(p.landlord?.fullName || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm text-slate-600">
                        <div className="font-semibold text-slate-800">{p.landlord?.fullName || "—"}</div>
                        <div className="text-xs text-slate-500">{p.landlord?.phoneNumber || p.landlord?.email || ""}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-sm text-slate-700">
                      <span><span className="text-xs uppercase tracking-wide text-slate-400"></span><br /> {formatCurrency(p.price)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-2 text-sm">
                      <StatusBadge status={p.postStatus} />
                      {p.status && (
                        <span className="inline-flex rounded-full border border-slate-200 px-2 py-[2px] text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {p.status}
                        </span>
                      )}
                    </div>
                    {p.rejectedReason && (
                      <p className="mt-2 text-xs text-rose-600">Lý do: {p.rejectedReason}</p>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                    <div className="grid gap-1">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400"></span><br />
                        {formatTimeFirstDate(p.createdAt)}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(p.propertyId)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50/60"
                      >
                        Xem
                      </button>

                      {p.postStatus === "PENDING" && (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => onApprove(p)}
                            className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busy ? "Đang xử lý" : "Duyệt"}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => onReject(p)}
                            className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                        </>
                      )}

                      <button
                        disabled={busy}
                        onClick={() => onDelete(p)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Xoá
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

      {/* Footer: pagination */}
      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> bản ghi
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 0} onClick={onPageFirst} className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50">« Đầu</button>
          <button disabled={page <= 0} onClick={onPagePrev}  className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50">‹ Trước</button>
          <span className="text-sm font-medium text-slate-700">Trang <b>{page + 1}</b>/<b>{Math.max(totalPages, 1)}</b></span>
          <button disabled={page + 1 >= totalPages} onClick={onPageNext} className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50">Tiếp ›</button>
          <button disabled={page + 1 >= totalPages} onClick={onPageLast} className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50">Cuối »</button>
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

