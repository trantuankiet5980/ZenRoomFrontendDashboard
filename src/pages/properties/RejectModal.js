import { useState } from "react";

export default function RejectModal({ onCancel, onConfirm }) {
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
