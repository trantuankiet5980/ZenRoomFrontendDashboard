export default function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  confirmVariant = "danger",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const confirmBaseClass =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-offset-1";
  const confirmClassName =
    confirmVariant === "danger"
      ? `${confirmBaseClass} bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus:ring-rose-200`
      : `${confirmBaseClass} bg-brandBtn text-slate-900 shadow-brand hover:brightness-105 focus:ring-amber-200`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmClassName} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading ? "Đang xử lý…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}