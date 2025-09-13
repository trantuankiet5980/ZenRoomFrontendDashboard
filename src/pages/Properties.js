import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../utils/toast";
import {
  fetchProperties, setStatus, setQ, setPage, setSize,
  fetchPropertyById, clearDetail,
  updatePropertyStatus, deleteProperty, clearError,
} from "../redux/slices/propertiesSlice";
import StatusBadge from "../components/StatusBadge";
import { resolveAvatarUrl, resolveAssetUrl } from "../utils/cdn";
import S3Image from "../components/S3Image";

const TABS = [
  { key: "",         label: "Tất cả" },
  { key: "PENDING",  label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Từ chối" }
];

export default function Properties() {
  const dispatch = useDispatch();
  const { items, page, size, totalPages, totalElements, status, q, loading, error,
     detail, detailLoading, actionLoadingId
   } = useSelector(s => s.properties);

  // Fetch list
  useEffect(() => {
    dispatch(fetchProperties({ page, size, status, q }));
  }, [dispatch, page, size, status, q]);

  // toast lỗi (nếu có)
  useEffect(() => {
    if (error) {
      showToast("error", "Lỗi" + error);
    }
  }, [error, dispatch]);

  // debounce search (nhẹ nhàng)
  const [kw, setKw] = useState(q || "");
  useEffect(() => {
    const id = setTimeout(() => dispatch(setQ(kw.trim() || "")), 350);
    return () => clearTimeout(id);
  }, [kw, dispatch]);

  const pageInfo = useMemo(() => {
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min(totalElements, (page + 1) * size);
    return { from, to };
  }, [page, size, totalElements]);

  // detail drawer
  const [openDetail, setOpenDetail] = useState(false);
  const onView = (id) => {
    dispatch(fetchPropertyById(id));
    setOpenDetail(true);
  };
  const closeDetail = () => { setOpenDetail(false); dispatch(clearDetail()); };

  // approve / reject
  const onApprove = async (row) => {
    await dispatch(updatePropertyStatus({ propertyId: row.propertyId, status: "APPROVED" }));
  };
  const [rejectTarget, setRejectTarget] = useState(null);
  const onReject = (row) => setRejectTarget(row);
  const doReject = async (reason) => {
    if (!rejectTarget) return;
    await dispatch(updatePropertyStatus({
      propertyId: rejectTarget.propertyId,
      status: "REJECTED",
      reason: reason?.trim() || undefined,
    }));
    setRejectTarget(null);
  };

  const onDelete = async (row) => {
    if (!window.confirm("Xoá bài đăng này?")) return;
    await dispatch(deleteProperty(row.propertyId));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bài đăng</h1>
          <p className="text-slate-500">Lọc theo trạng thái & tìm kiếm theo tiêu đề/mô tả/tòa/phòng</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="Tìm theo: tiêu đề, mô tả, tên toà (building), số phòng (room)…"
            className="w-96 max-w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
          />
          <select
            value={size}
            onChange={(e) => dispatch(setSize(Number(e.target.value)))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            title="Số dòng / trang"
          >
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => dispatch(setStatus(t.key))}
              className={`px-3 py-1.5 rounded-lg border text-sm
                ${status === t.key
                  ? "bg-brandBtn text-slate-900 border-amber-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
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
                return (
                  <tr key={p.propertyId} className="hover:bg-amber-50/40">
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-800">{p.title || "(Không tiêu đề)"}</div>
                      <div className="text-xs text-slate-500">
                        {p.propertyType} · {p.area ?? "—"} m² · {p.capacity ?? "—"} người · P.{p.roomNumber ?? "—"}
                      </div>
                      {p.address?.addressFull && (
                        <div className="text-xs text-slate-500 truncate max-w-[360px]">{p.address.addressFull}</div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {p.landlord?.avatarUrl ? (
                          <img
                            src={resolveAvatarUrl(p.landlord.avatarUrl)}
                            alt="ll"
                            className="h-8 w-8 rounded-full object-cover border"
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
                        <button
                          onClick={() => onView(p.propertyId)}
                          className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50"
                        >
                          Xem
                        </button>
                        {p.postStatus === "PENDING" && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() => onApprove(p)}
                              className="px-2 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:brightness-95 disabled:opacity-50"
                            >
                              {busy ? "..." : "Duyệt"}
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => onReject(p)}
                              className="px-2 py-1.5 rounded-lg bg-rose-100 text-rose-800 hover:brightness-95 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => onDelete(p)}
                          className="px-2 py-1.5 rounded-lg border bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
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

          {loading && <div className="p-4 text-sm text-slate-500">Đang tải…</div>}
        </div>

        {/* Footer: pagination */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-2">
          <div className="text-xs text-slate-500">
            Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 0} onClick={() => dispatch(setPage(0))}
              className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">« Đầu</button>
            <button disabled={page <= 0} onClick={() => dispatch(setPage(page - 1))}
              className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">‹ Trước</button>
            <span className="text-sm text-slate-600">Trang <b>{page + 1}</b>/<b>{Math.max(totalPages, 1)}</b></span>
            <button disabled={page + 1 >= totalPages} onClick={() => dispatch(setPage(page + 1))}
              className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">Tiếp ›</button>
            <button disabled={page + 1 >= totalPages} onClick={() => dispatch(setPage(totalPages - 1))}
              className="px-2 py-1 rounded-lg border text-sm disabled:opacity-40">Cuối »</button>
          </div>
        </div>
      </div>

      {/* ===== Drawer xem chi tiết ===== */}
      {openDetail && (
        <DetailDrawer open={openDetail} onClose={closeDetail} loading={detailLoading} data={detail} />
      )}

      {/* ===== Modal từ chối ===== */}
      {rejectTarget && (
        <RejectModal onCancel={() => setRejectTarget(null)} onConfirm={doReject} />
      )}
    </div>
  );
}

/* ===== helpers ===== */
function formatCurrency(n) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n}`;
  }
}
function formatDateTime(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("vi-VN");
}

/* ===== Modal & Drawer components (inline để dán nhanh) ===== */
function RejectModal({ onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">Lý do từ chối</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
          rows={4}
          placeholder="Nhập lý do…"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-lg border">Huỷ</button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-3 py-2 rounded-lg bg-rose-100 text-rose-800"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ open, onClose, loading, data }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl border-l">
        <div className="h-14 px-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chi tiết bài đăng</h3>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-slate-50">✕</button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
          {loading && <div className="text-slate-500">Đang tải…</div>}
          {!loading && !data && <div className="text-slate-500">Không có dữ liệu</div>}
          {!loading && data && (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-bold text-slate-800">{data.title}</div>
                <div className="text-slate-600">{data.description}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Loại: <b>{data.propertyType}</b> · Diện tích: <b>{data.area ?? "—"} m²</b> · Tầng: <b>{data.floorNo ?? "—"}</b>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Giá: <b>{formatCurrency(data.price)}</b> · Cọc: <b>{formatCurrency(data.deposit)}</b>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Trạng thái: <StatusBadge status={data.postStatus} />
                  {data.rejectedReason && <span className="ml-2 text-rose-700">(Lý do: {data.rejectedReason})</span>}
                </div>
              </div>

              {data.address?.addressFull && (
                <div className="text-sm text-slate-600">Địa chỉ: {data.address.addressFull}</div>
              )}

              {/* Landlord */}
              <div className="rounded-xl border p-3">
                <div className="font-medium mb-2">Chủ nhà</div>
                <div className="flex items-center gap-2">
                  {data.landlord?.avatarUrl ? (
<                   S3Image src={data.landlord.avatarUrl} className="h-10 w-10 rounded-full object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-amber-200 grid place-items-center text-sm font-semibold text-amber-900">
                      {(data.landlord?.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium">{data.landlord?.fullName}</div>
                    <div className="text-slate-500">{data.landlord?.phoneNumber || data.landlord?.email}</div>
                  </div>
                </div>
              </div>

              {/* Furnishings */}
              {Array.isArray(data.furnishings) && data.furnishings.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Nội thất</div>
                  <ul className="list-disc pl-5 text-sm text-slate-700">
                    {data.furnishings.map(f => (
                      <li key={f.id || f.furnishingId}>{f.furnishingName} {f.quantity ? `x${f.quantity}` : ""}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Media gallery */}
              {Array.isArray(data.media) && data.media.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Ảnh và video</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[...data.media]
                        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                        .map((m) => (
                            <div key={m.mediaId} className="rounded-lg overflow-hidden border">
                                {m.mediaType === "VIDEO" ? (
                                <video
                                    controls
                                    poster={m.posterUrl ? resolveAssetUrl(m.posterUrl) : undefined}
                                    src={resolveAssetUrl(m.url)}
                                    className="w-full h-36 object-cover bg-black"
                                    onError={(e) => 
                                        console.warn("VIDEO LOAD ERROR:", {
                                            src: resolveAssetUrl(m.url),
                                            poster: m.posterUrl ? resolveAssetUrl(m.posterUrl) : null
                                })}
                                />
                                ) : (
                                <S3Image src={m.url} alt={m.mediaId} className="w-full h-36 object-cover" />
                                )}
                            </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
