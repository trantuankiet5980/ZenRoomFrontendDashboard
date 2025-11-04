import { useEffect } from "react";
import { getInvoiceStatusMeta } from "./constants";
import { formatCurrency, formatDate, formatTimeFirstDate } from "../../utils/format";

export default function InvoiceDetailDrawer({ open, invoice, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const statusMeta = getInvoiceStatusMeta(invoice?.status);
  const booking = invoice?.booking ?? {};
  const property = booking.property ?? {};

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => onClose?.()} />

      <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Chi tiết hóa đơn</h2>
            <p className="text-xs text-slate-500">Xem đầy đủ thông tin phát hành và thanh toán hóa đơn</p>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50"
          >
            <span className="sr-only">Đóng</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!invoice ? (
            <div className="grid h-full place-items-center text-sm text-slate-500">
              Không tìm thấy thông tin hóa đơn.
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Mã hóa đơn</div>
                    <div className="text-lg font-semibold text-slate-800">{invoice.invoiceNo || invoice.invoiceId}</div>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className={`inline-flex items-center justify-center rounded-full border px-3 py-[3px] text-xs font-semibold ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                    <div className="text-xs text-slate-500 max-w-xs sm:text-right">{statusMeta.description}</div>
                    {invoice.cancellationReason ? (
                      <div className="text-xs text-rose-500">Lý do hủy: {invoice.cancellationReason}</div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Tổng quan thanh toán</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="Tổng tiền" value={formatCurrency(invoice.totalPrice ?? invoice.total)} hint="Đã bao gồm thuế và phí" />
                  <InfoCard
                    label="Phí hủy"
                    value={invoice.cancellationFee == null ? "-" : formatCurrency(invoice.cancellationFee)}
                    variant="muted"
                  />
                  <InfoCard
                    label="Số tiền hoàn"
                    value={invoice.refundableAmount == null ? "-" : formatCurrency(invoice.refundableAmount)}
                  />
                  <InfoCard label="Giảm giá" value={formatCurrency(invoice.discount)} variant="muted" />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Thông tin thanh toán</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <InfoRow label="Phương thức" value={invoice.paymentMethod || "—"} />
                  <InfoRow label="Mã tham chiếu" value={invoice.paymentRef || "—"} copyable />
                  <InfoRow label="Thanh toán lúc" value={formatTimeFirstDate(invoice.paidAt)} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Khách thuê &amp; chủ nhà</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border border-slate-100 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Khách thuê</div>
                    <InfoRow label="Họ tên" value={invoice.tenantName || booking?.tenant?.fullName || "—"} />
                    <InfoRow label="Email" value={invoice.tenantEmail || booking?.tenant?.email || "—"} />
                    <InfoRow label="Số điện thoại" value={invoice.tenantPhone || booking?.tenant?.phoneNumber || "—"} />
                  </div>
                  <div className="space-y-2 rounded-2xl border border-slate-100 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Chủ nhà</div>
                    <InfoRow label="Họ tên" value={invoice.landlordName || property?.landlord?.fullName || "—"} />
                    <InfoRow label="Email" value={invoice.landlordEmail || property?.landlord?.email || "—"} />
                    <InfoRow label="Số điện thoại" value={invoice.landlordPhone || property?.landlord?.phoneNumber || "—"} />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Thông tin đặt chỗ</h3>
                <div className="space-y-2 rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                  <InfoRow label="Trạng thái" value={booking.bookingStatus || "—"} />
                  <InfoRow label="Thời gian" value={`${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`} />
                  <InfoRow label="Tổng tiền" value={formatCurrency(booking.totalPrice)} />
                  <InfoRow label="Ghi chú" value={booking.note || "—"} multiline />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Tài sản liên quan</h3>
                <div className="space-y-2 rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                  <InfoRow label="Tiêu đề" value={invoice.propertyTitle || property.title || "—"} />
                  <InfoRow label="Địa chỉ" value={invoice.propertyAddressText || property?.address?.addressFull || "—"} multiline />
                  <InfoRow label="Loại" value={property.propertyType || "—"} />
                  <InfoRow label="Giá niêm yết" value={formatCurrency(property.price)} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Dòng thời gian</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Phát hành", value: invoice.issuedAt },
                    { label: "Đến hạn", value: invoice.dueAt },
                    { label: "Thanh toán", value: invoice.paidAt },
                    { label: "Hủy", value: invoice.cancelledAt },
                    { label: "Yêu cầu hoàn", value: invoice.refundRequestedAt },
                    { label: "Hoàn tiền", value: invoice.refundConfirmedAt },
                  ]
                    .filter(({ value }) => value != null)
                    .map(({ label, value }) => (
                      <InfoCard key={label} label={label} value={formatTimeFirstDate(value)} />
                    ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoCard({ label, value, hint, variant }) {
  const baseClass = "rounded-2xl border px-4 py-3";
  const variantClass =
    variant === "warning"
      ? "border-amber-200 bg-amber-50/80 text-amber-700"
      : variant === "muted"
      ? "border-slate-100 bg-slate-50 text-slate-500"
      : "border-slate-100 bg-white text-slate-700";

  return (
    <div className={`${baseClass} ${variantClass}`}>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value ?? "—"}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function InfoRow({ label, value, hint, copyable = false, isLink = false, multiline = false }) {
  const content = value ?? "—";
  const displayValue = multiline && typeof content === "string" ? content : String(content || "—");

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {isLink && typeof content === "string" && content.startsWith("http") ? (
        <a href={content} target="_blank" rel="noreferrer" className="text-sm font-medium text-amber-600 hover:text-amber-700">
          {content}
        </a>
      ) : (
        <div className={`text-sm ${multiline ? "whitespace-pre-wrap break-words" : "truncate"}`} title={displayValue}>
          {displayValue}
        </div>
      )}
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      {copyable && content && typeof navigator !== "undefined" ? (
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText?.(content)}
          className="w-fit text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          Sao chép
        </button>
      ) : null}
    </div>
  );
}