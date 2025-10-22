import { useEffect } from "react";
import StatusBadge from "../../components/StatusBadge";
import { resolveAvatarUrl } from "../../utils/cdn";

const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
  BANNED: "Đã cấm",
  DELETED: "Đã xoá",
  PENDING_DELETE: "Chờ xoá",
};

export default function UserDetailDrawer({ user, onClose, onEdit, onBan, onDelete }) {
  useEffect(() => {
    if (!user) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [user, onClose]);

  if (!user) return null;

  const avatarUrl = user.avatarUrl ? resolveAvatarUrl(user.avatarUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => onClose?.()} />

      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Chi tiết người dùng</h2>
            <p className="text-xs text-slate-500">Quản lý thông tin và trạng thái tài khoản</p>
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
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName || "Người dùng"}
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-200 text-lg font-semibold text-amber-900">
                  {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="text-lg font-semibold text-slate-800">{user.fullName || "(Chưa cập nhật)"}</div>
                <div className="text-sm text-slate-500">{user.email || "Chưa có email"}</div>
                {user.phoneNumber && <div className="text-sm text-slate-500">SĐT: {user.phoneNumber}</div>}
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status={user.status} />
                  <span className="text-xs text-slate-500">{STATUS_LABELS[user.status] || user.status || "Không rõ"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin liên hệ</h3>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-right font-medium text-slate-700">{user.email || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Số điện thoại</dt>
                  <dd className="text-right font-medium text-slate-700">{user.phoneNumber || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Vai trò</dt>
                  <dd className="text-right font-medium text-slate-700">{user.roleName || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Mã vai trò</dt>
                  <dd className="text-right font-medium text-slate-700">{user.roleId || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Mã người dùng</dt>
                  <dd className="text-right font-medium text-slate-700 break-all">{user.userId}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hoạt động gần đây</h3>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Tạo lúc</dt>
                  <dd className="text-right font-medium text-slate-700">{formatDateTime(user.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Đăng nhập cuối</dt>
                  <dd className="text-right font-medium text-slate-700">{formatDateTime(user.lastLogin)}</dd>
                </div>
                {user.deleteRequestedAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Yêu cầu xoá</dt>
                    <dd className="text-right font-medium text-slate-700">{formatDateTime(user.deleteRequestedAt)}</dd>
                  </div>
                )}
                {user.deleteEffectiveAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Xoá vào</dt>
                    <dd className="text-right font-medium text-slate-700">{formatDateTime(user.deleteEffectiveAt)}</dd>
                  </div>
                )}
                {user.banReason && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Lý do cấm</dt>
                    <dd className="text-right font-medium text-rose-600">{user.banReason}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        </div>

        <footer className="grid gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={() => onEdit?.(user)}
            className="rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105"
          >
            Cập nhật thông tin
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onBan?.(user)}
              className="flex-1 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
            >
              Cấm người dùng
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(user)}
              className="flex-1 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
            >
              Xoá tài khoản
            </button>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
          >
            Đóng
          </button>
        </footer>
      </aside>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", { hour12: false });
}