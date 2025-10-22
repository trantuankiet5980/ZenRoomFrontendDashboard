import { useEffect, useMemo, useState } from "react";
import { DISCOUNT_TYPE_OPTIONS } from "./constants";
import { formatDateInput } from "../../utils/format";

const DEFAULT_FORM = {
  codeId: "",
  code: "",
  description: "",
  discountType: "FIXED",
  discountValue: "",
  validFrom: "",
  validTo: "",
  usageLimit: "",
  status: "ACTIVE",
};

export default function DiscountCodeFormModal({
  open,
  title,
  initialValues,
  submitting,
  onClose,
  onSubmit,
}) {
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setFormValues(mapInitialValues(initialValues));
    setErrors({});
  }, [open, initialValues]);

  const dateError = useMemo(() => {
    const { validFrom, validTo } = formValues;
    if (validFrom && validTo) {
      const from = new Date(validFrom);
      const to = new Date(validTo);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        return "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.";
      }
    }
    return "";
  }, [formValues]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm(formValues, dateError);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit?.(normalizePayload(formValues));
  };

  const isEditing = Boolean(formValues.codeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">
              {isEditing
                ? "Cập nhật thông tin mã giảm giá và kiểm soát trạng thái sử dụng."
                : "Nhập thông tin để tạo mã giảm giá mới cho chiến dịch khuyến mãi."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-2 text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600"
          >
            <span className="sr-only">Đóng</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Mã giảm giá
            <input
              type="text"
              value={formValues.code}
              onChange={(event) => handleChange("code", event.target.value.toUpperCase())}
              placeholder="Ví dụ: SUMMER50"
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.code ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
              maxLength={50}
              required
            />
            {errors.code ? <span className="text-xs text-rose-500">{errors.code}</span> : null}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Mô tả
            <textarea
              value={formValues.description}
              onChange={(event) => handleChange("description", event.target.value)}
              placeholder="Mô tả ngắn gọn về chương trình"
              rows={3}
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.description ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
            />
            {errors.description ? <span className="text-xs text-rose-500">{errors.description}</span> : null}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Loại giảm giá
            <select
              value={formValues.discountType}
              onChange={(event) => handleChange("discountType", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              {DISCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Giá trị giảm
            <input
              type="number"
              min="0"
              step="0.01"
              value={formValues.discountValue}
              onChange={(event) => handleChange("discountValue", event.target.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.discountValue ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
              placeholder={formValues.discountType === "PERCENT" ? "Ví dụ: 10" : "Ví dụ: 50000"}
            />
            {errors.discountValue ? <span className="text-xs text-rose-500">{errors.discountValue}</span> : null}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Ngày bắt đầu
            <input
              type="date"
              value={formatDateInput(formValues.validFrom)}
              onChange={(event) => handleChange("validFrom", event.target.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.validFrom ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
            />
            {errors.validFrom ? <span className="text-xs text-rose-500">{errors.validFrom}</span> : null}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Ngày kết thúc
            <input
              type="date"
              value={formatDateInput(formValues.validTo)}
              onChange={(event) => handleChange("validTo", event.target.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.validTo ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
            />
            {errors.validTo ? <span className="text-xs text-rose-500">{errors.validTo}</span> : null}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Giới hạn sử dụng
            <input
              type="number"
              min="0"
              step="1"
              value={formValues.usageLimit}
              onChange={(event) => handleChange("usageLimit", event.target.value)}
              placeholder="Ví dụ: 100"
              className={`rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 ${
                errors.usageLimit ? "border-rose-300 text-rose-600" : "border-slate-200 text-slate-700"
              }`}
            />
            {errors.usageLimit ? <span className="text-xs text-rose-500">{errors.usageLimit}</span> : null}
          </label>
        </div>

        {dateError ? (
          <div className="px-6">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{dateError}</div>
          </div>
        ) : null}

        {errors.form ? (
          <div className="px-6">
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{errors.form}</div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang lưu…" : isEditing ? "Cập nhật" : "Tạo mã"}
          </button>
        </div>
      </form>
    </div>
  );
}

function mapInitialValues(values) {
  const safeValues = values && typeof values === "object" ? values : {};

  return {
    codeId: safeValues.codeId || "",
    code: safeValues.code || "",
    description: safeValues.description || "",
    discountType: safeValues.discountType || "FIXED",
    discountValue:
      safeValues.discountValue === null || safeValues.discountValue === undefined
        ? ""
        : String(safeValues.discountValue),
    validFrom: formatDateInput(safeValues.validFrom),
    validTo: formatDateInput(safeValues.validTo),
    usageLimit:
      safeValues.usageLimit === null || safeValues.usageLimit === undefined
        ? ""
        : String(safeValues.usageLimit),
    status: safeValues.status || "ACTIVE",
  };
}

function normalizePayload(values) {
  const payload = {
    code: values.code.trim(),
    description: values.description?.trim() || "",
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    validFrom: values.validFrom || null,
    validTo: values.validTo || null,
    usageLimit:
      values.usageLimit === "" || values.usageLimit === null || values.usageLimit === undefined
        ? null
        : Number(values.usageLimit),
    status: values.status,
  };

  if (values.codeId) {
    payload.codeId = values.codeId;
  }

  return payload;
}

function validateForm(values, dateError) {
  const result = {};
  if (!values.code || !values.code.trim()) {
    result.code = "Vui lòng nhập mã giảm giá.";
  }

  if (!values.discountValue || Number(values.discountValue) <= 0) {
    result.discountValue = "Giá trị giảm phải lớn hơn 0.";
  }

  if (!values.validFrom) {
    result.validFrom = "Vui lòng chọn ngày bắt đầu.";
  }

  if (!values.validTo) {
    result.validTo = "Vui lòng chọn ngày kết thúc.";
  }

  if (values.usageLimit !== "" && Number(values.usageLimit) < 0) {
    result.usageLimit = "Giới hạn sử dụng không hợp lệ.";
  }

  if (dateError) {
    result.form = dateError;
  }

  return Object.keys(result).length > 0 ? result : null;
}