import { resolveAssetUrl, resolveAvatarUrl } from "../../utils/cdn";
import S3Image from "../../components/S3Image";
import StatusBadge from "../../components/StatusBadge";

export default function DetailDrawer({ open, onClose, loading, data }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
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
                    <S3Image
                      src={data.landlord.avatarUrl}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
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
                      <li key={f.id || f.furnishingId}>
                        {f.furnishingName} {f.quantity ? `x${f.quantity}` : ""}
                      </li>
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
                      .sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map(m => (
                        <div key={m.mediaId} className="rounded-lg overflow-hidden border">
                          {m.mediaType === "VIDEO" ? (
                            <video
                              controls
                              poster={m.posterUrl ? resolveAssetUrl(m.posterUrl) : undefined}
                              src={resolveAssetUrl(m.url)}
                              className="w-full h-36 object-cover bg-black"
                              onError={() => console.warn("VIDEO LOAD ERROR:", {
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

function formatCurrency(n) {
  if (n == null) return "—";
  try { return new Intl.NumberFormat("vi-VN",{ style:"currency", currency:"VND", maximumFractionDigits:0 }).format(n); }
  catch { return `${n}`; }
}
