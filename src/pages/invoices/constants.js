export const INVOICE_STATUS_META = {
  // DRAFT: {
  //   label: "Nháp",
  //   description: "Hóa đơn đang được chuẩn bị, chưa phát hành",
  //   className: "bg-slate-100 text-slate-700 border-slate-200",
  // },
  ISSUED: {
    label: "Đã phát hành",
    description: "Đã phát hành và chờ thanh toán",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  PAID: {
    label: "Đã thanh toán",
    description: "Hóa đơn đã được thanh toán đầy đủ",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  REFUND_PENDING: {
    label: "Chờ hoàn tiền",
    description: "Đang chờ xác nhận hoàn tiền thủ công",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    description: "Hóa đơn đã được hoàn tiền",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  VOID: {
    label: "Đã hủy",
    description: "Hóa đơn đã bị vô hiệu hóa",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export const INVOICE_STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  // { value: "DRAFT", label: INVOICE_STATUS_META.DRAFT.label },
  { value: "ISSUED", label: INVOICE_STATUS_META.ISSUED.label },
  { value: "PAID", label: INVOICE_STATUS_META.PAID.label },
  { value: "REFUND_PENDING", label: INVOICE_STATUS_META.REFUND_PENDING.label },
  { value: "REFUNDED", label: INVOICE_STATUS_META.REFUNDED.label },
  { value: "VOID", label: INVOICE_STATUS_META.VOID.label },
];

export function getInvoiceStatusMeta(status) {
  return INVOICE_STATUS_META[status] || {
    label: status || "Không rõ",
    description: "Trạng thái không xác định",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };
}