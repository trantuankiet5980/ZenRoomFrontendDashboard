import { resolveAssetUrl } from "../../utils/cdn";
import S3Image from "../../components/S3Image";
import StatusBadge from "../../components/StatusBadge";

export default function DetailDrawer({ open, onClose, loading, data }) {
  const hasServices = Array.isArray(data?.services) && data.services.length > 0;
  const hasFurnishings = Array.isArray(data?.furnishings) && data.furnishings.length > 0;
  const hasMedia = Array.isArray(data?.media) && data.media.length > 0;

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-4xl border-l bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Chi tiết bài đăng</h3>
            {data?.propertyId && (
              <p className="text-xs text-slate-400">Mã: {data.propertyId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50/60"
            aria-label="Đóng chi tiết"
          >
            ✕
          </button>
        </div>

       <div className="h-[calc(100%-64px)] overflow-y-auto px-6 py-6">
          {loading && <div className="text-sm text-slate-500">Đang tải dữ liệu…</div>}
          {!loading && !data && <div className="text-sm text-slate-500">Không tìm thấy thông tin bài đăng.</div>}
          {!loading && data && (
            <div className="space-y-6">
              {/* Overview */}
              <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                      <span className="rounded-lg bg-amber-100 px-2 py-[2px] text-amber-700">{data.propertyType || "Không rõ"}</span>
                      {data.buildingName && (
                        <span className="rounded-lg bg-white px-2 py-[2px] text-slate-500">{data.buildingName}</span>
                      )}
                      {data.apartmentCategory && (
                        <span className="rounded-lg bg-white px-2 py-[2px] text-slate-500">{data.apartmentCategory}</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{data.title || "(Không có tiêu đề)"}</h2>
                    {data.description && (
                      <p className="text-sm leading-relaxed text-slate-600">{data.description}</p>
                    )}
                    {data.address?.addressFull && (
                      <p className="text-sm text-slate-500">
                        📍 {data.address.addressFull}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <StatusBadge status={data.postStatus} />
                    {data.status && <StatusBadge status={data.status} />}
                    {data.rejectedReason && (
                      <p className="max-w-xs text-sm text-rose-600">Lý do từ chối: {data.rejectedReason}</p>
                    )}
                  </div>
                </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <InfoItem label="Giá thuê" value={formatCurrency(data.price)} />
                  <InfoItem label="Diện tích" value={data.area != null ? `${data.area} m²` : "—"} />
                  <InfoItem label="Sức chứa" value={data.capacity != null ? `${data.capacity} người` : "—"} />
                  <InfoItem label="Phòng" value={data.roomNumber || "—"} />
                  <InfoItem label="Tầng" value={data.floorNo != null ? data.floorNo : "—"} />
                  <InfoItem label="Phòng tắm" value={data.bathrooms != null ? data.bathrooms : "—"} />
                  <InfoItem label="Phòng ngủ" value={data.bedrooms != null ? data.bedrooms : "—"} />
                </div>
              </section>

              {/* Landlord */}
              <section className="rounded-2xl border border-slate-100 p-5">
                <h3 className="text-base font-semibold text-slate-800">Chủ nhà phụ trách</h3>
                <div className="mt-3 flex items-center gap-3">
                  {data.landlord?.avatarUrl ? (
                    <S3Image
                      src={data.landlord.avatarUrl}
                      className="h-14 w-14 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-200 text-lg font-semibold text-amber-900">
                      {(data.landlord?.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm text-slate-600">
                    <p className="text-base font-semibold text-slate-800">{data.landlord?.fullName || "—"}</p>
                    <p>{data.landlord?.phoneNumber || "—"}</p>
                    {data.landlord?.email && <p>{data.landlord.email}</p>}
                  </div>
                </div>
                  </section>

              {/* Services */}
              {hasServices && (
                <section className="rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-base font-semibold text-slate-800">Dịch vụ đi kèm</h3>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Tên dịch vụ</th>
                          <th className="px-4 py-3">Chi phí</th>
                          <th className="px-4 py-3">Hình thức tính</th>
                          <th className="px-4 py-3">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.services.map((sv) => (
                          <tr key={sv.id || sv.serviceName}>
                            <td className="px-4 py-3 text-slate-700">
                              <div className="font-medium text-slate-800">{sv.serviceName}</div>
                              <div className="text-xs text-slate-500">{sv.isIncluded ? "Đã bao gồm" : "Tính thêm"}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{formatCurrency(sv.fee)}</td>
                            <td className="px-4 py-3 text-slate-700">{formatChargeBasis(sv.chargeBasis)}</td>
                            <td className="px-4 py-3 text-slate-600">{sv.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {/* Furnishings */}
              {hasFurnishings && (
                <section className="rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-base font-semibold text-slate-800">Trang bị nội thất</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    {data.furnishings.map((f) => (
                      <li key={f.id || f.furnishingId} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="font-medium text-slate-800">{f.furnishingName}</p>
                        {f.quantity ? <p className="text-xs text-slate-500">Số lượng: {f.quantity}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Media gallery */}
              {hasMedia && (
                <section className="rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-base font-semibold text-slate-800">Thư viện hình ảnh &amp; video</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[...data.media]
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((m) => (
                        <div key={m.mediaId} className="overflow-hidden rounded-xl border border-slate-100">
                          {m.mediaType === "VIDEO" ? (
                            <video
                              controls
                              poster={m.posterUrl ? resolveAssetUrl(m.posterUrl) : undefined}
                              src={resolveAssetUrl(m.url)}
                              className="h-40 w-full bg-black object-cover"
                              onError={() => console.warn("VIDEO LOAD ERROR:", {
                                src: resolveAssetUrl(m.url),
                                poster: m.posterUrl ? resolveAssetUrl(m.posterUrl) : null,
                              })}
                            />
                          ) : (
                            <S3Image src={m.url} alt={m.mediaId} className="h-40 w-full object-cover" />
                          )}
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* Timeline */}
              <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <h3 className="text-base font-semibold text-slate-800">Mốc thời gian</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <InfoItem label="Tạo lúc" value={formatDateTime(data.createdAt)} />
                  <InfoItem label="Cập nhật" value={formatDateTime(data.updatedAt)} />
                  <InfoItem label="Trạng thái hiện tại" value={data.status || "—"} />
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{value ?? "—"}</div>
    </div>
  );
}

function formatCurrency(n) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);
  } catch (e) {
    return `${n}`;
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN");
}

function formatChargeBasis(basis) {
  if (!basis) return "—";
  const map = {
    FIXED: "Cố định",
    PER_MONTH: "Theo tháng",
    PER_DAY: "Theo ngày",
    PER_PERSON: "Theo người",
  };
  return map[basis] || basis;
}
