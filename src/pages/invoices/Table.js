import { getInvoiceStatusMeta } from "./constants";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";

export default function InvoiceTable({
  invoices = [],
  loading,
  page = 0,
  totalPages = 0,
  totalElements = 0,
  pageInfo = { from: 0, to: 0 },
  actionLoadingId,
  onPageFirst,
  onPagePrev,
  onPageNext,
  onPageLast,
  onView,
  onRefund,
}) {
  const showEmpty = !loading && (!invoices || invoices.length === 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Hóa đơn</th>
              <th className="px-4 py-3">Khách thuê &amp; chủ nhà</th>
              <th className="px-4 py-3">Căn hộ</th>
              <th className="px-4 py-3">Mốc thời gian</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showEmpty && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không có hóa đơn nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {invoices.map((invoice) => {
              const statusMeta = getInvoiceStatusMeta(invoice.status);
              const canRefund = invoice.status === "REFUND_PENDING";
              const isRefunding = actionLoadingId === invoice.invoiceId;
              const booking = invoice.booking || {};
              const property = booking.property || {};

              return (
                <tr key={invoice.invoiceId} className="hover:bg-amber-50/40">
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1 text-sm text-slate-700">
                      <div className="font-semibold text-slate-800">{invoice.invoiceNo || invoice.invoiceId}</div>
                      <div className="text-xs text-slate-500">Tổng cộng: {formatCurrency(invoice.total)}</div>
                      {invoice.discount ? (
                        <div className="text-xs text-rose-500">Giảm giá: {formatCurrency(invoice.discount)}</div>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Khách thuê</div>
                        <div className="font-medium text-slate-800">{invoice.tenantName || booking?.tenant?.fullName || "—"}</div>
                        <div className="text-xs text-slate-500">{invoice.tenantEmail || booking?.tenant?.email || "—"}</div>
                        <div className="text-xs text-slate-500">{invoice.tenantPhone || booking?.tenant?.phoneNumber || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Chủ nhà</div>
                        <div className="font-medium text-slate-800">{invoice.landlordName || property?.landlord?.fullName || "—"}</div>
                        <div className="text-xs text-slate-500">{invoice.landlordEmail || property?.landlord?.email || "—"}</div>
                        <div className="text-xs text-slate-500">{invoice.landlordPhone || property?.landlord?.phoneNumber || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="font-semibold text-slate-800">{invoice.propertyTitle || property?.title || "—"}</div>
                      <div className="text-xs text-slate-500">{invoice.propertyAddressText || property?.address?.addressFull || "—"}</div>
                      <div className="text-xs text-slate-500">
                        Thời gian: {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>Phát hành: <span className="font-medium text-slate-700">{formatDateTime(invoice.issuedAt)}</span></div>
                      <div>Đến hạn: <span className="font-medium text-slate-700">{formatDateTime(invoice.dueAt)}</span></div>
                      <div>Thanh toán: <span className="font-medium text-slate-700">{formatDateTime(invoice.paidAt)}</span></div>
                      <div>Tạo lúc: <span className="font-medium text-slate-700">{formatDateTime(invoice.createdAt)}</span></div>
                      <div>Cập nhật: <span className="font-medium text-slate-700">{formatDateTime(invoice.updatedAt)}</span></div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center justify-center rounded-full border px-3 py-[3px] text-xs font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                      <p className="text-xs text-slate-500 max-w-[180px]">{statusMeta.description}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView?.(invoice)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        disabled={!canRefund || isRefunding}
                        onClick={() => onRefund?.(invoice)}
                        className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRefunding ? "Đang xử lý…" : "Hoàn tiền"}
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

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          {totalElements > 0 ? (
            <>
              Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> hóa đơn
            </>
          ) : (
            <>Không có dữ liệu</>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 0}
            onClick={onPageFirst}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            « Đầu
          </button>
          <button
            type="button"
            disabled={page <= 0}
            onClick={onPagePrev}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹ Trước
          </button>
          <span className="text-sm font-medium text-slate-700">
            Trang <b>{totalPages === 0 ? 0 : page + 1}</b>/<b>{Math.max(totalPages, 1)}</b>
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={onPageNext}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau ›
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={onPageLast}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cuối »
          </button>
        </div>
      </div>
    </div>
  );
}
