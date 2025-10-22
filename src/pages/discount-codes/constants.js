export const DISCOUNT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "EXPIRED", label: "Hết hạn" },
];

export const DISCOUNT_STATUS_META = {
  ACTIVE: {
    label: "Đang hoạt động",
    className:
      "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-[2px] text-xs font-semibold text-emerald-700",
  },
  EXPIRED: {
    label: "Hết hạn",
    className:
      "inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-[2px] text-xs font-semibold text-slate-600",
  },
};

export const DISCOUNT_TYPE_OPTIONS = [
  { value: "FIXED", label: "Giảm theo số tiền" },
  { value: "PERCENT", label: "Giảm theo %" },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];