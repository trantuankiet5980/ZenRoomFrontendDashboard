import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { resolveAvatarUrl } from "../../utils/cdn";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
  { value: "UNSPECIFIED", label: "Không xác định" },
];

export default function UserDetailDrawer({
  open,
  user,
  loading = false,
  saving = false,
  onClose,
  onSubmit,
  onBan,
  onDelete,
}) {
  const [formValues, setFormValues] = useState(createFormValues(user));

  useEffect(() => {
    if (open && user) {
      setFormValues(createFormValues(user));
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) return null;
    return resolveAvatarUrl(user.avatarUrl);
  }, [user]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (saving) return;
    onSubmit?.(formValues);
  };

  if (!open) return null;

  const status = user?.status;
  const createdAt = user?.createdAt;
  const lastLogin = user?.lastLogin;
  const updatedAt = user?.updatedAt;
  const followers = user?.followers;
  const following = user?.following;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => onClose?.()} />

      <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Thông tin người dùng</h2>
            <p className="text-xs text-slate-500">Xem và cập nhật hồ sơ người dùng</p>
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
          {!user ? (
            <div className="grid h-full place-items-center text-sm text-slate-500">
              {loading ? "Đang tải thông tin người dùng…" : "Không tìm thấy thông tin người dùng."}
            </div>
          ) : (
            <div className="space-y-6">
              {loading && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                  Đang tải dữ liệu mới nhất…
                </div>
              )}

              <section className="flex items-start gap-4">
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

                <div className="flex-1 space-y-2">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">{user.fullName || "(Chưa cập nhật)"}</div>
                    <div className="text-sm text-slate-500">{user.email || "Chưa có email"}</div>
                    {user.phoneNumber && <div className="text-sm text-slate-500">SĐT: {user.phoneNumber}</div>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <StatusBadge status={status} />
                    {status && <span className="text-xs text-slate-500">{statusLabel(status)}</span>}
                  </div>
                </div>
              </section>

            <form id="user-detail-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formValues.fullName}
                    onChange={handleChange("fullName")}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                    disabled={saving}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-600" htmlFor="phoneNumber">
                      Số điện thoại
                    </label>
                    <input
                      id="phoneNumber"
                      type="text"
                      value={formValues.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                      disabled={saving}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange("email")}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                      disabled={saving}
                      placeholder="Nhập email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600" htmlFor="avatarUrl">
                    Ảnh đại diện (URL)
                  </label>
                  <input
                    id="avatarUrl"
                    type="text"
                    value={formValues.avatarUrl}
                    onChange={handleChange("avatarUrl")}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                    disabled={saving}
                    placeholder="Nhập đường dẫn ảnh"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-600" htmlFor="gender">
                      Giới tính
                    </label>
                    <select
                      id="gender"
                      value={formValues.gender}
                      onChange={handleChange("gender")}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                      disabled={saving}
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600" htmlFor="dateOfBirth">
                      Ngày sinh
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={formValues.dateOfBirth}
                      onChange={handleChange("dateOfBirth")}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                      disabled={saving}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600" htmlFor="bio">
                    Giới thiệu
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formValues.bio}
                    onChange={handleChange("bio")}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
                    disabled={saving}
                    placeholder="Mô tả ngắn về người dùng"
                  />
                </div>
              </form>

            <section className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hoạt động tài khoản</h3>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Tạo lúc</span>
                  <span className="font-medium text-slate-700">{formatDateTime(createdAt)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Cập nhật cuối</span>
                  <span className="font-medium text-slate-700">{formatDateTime(updatedAt)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Đăng nhập cuối</span>
                  <span className="font-medium text-slate-700">{formatDateTime(lastLogin)}</span>
                </div>
                {(followers != null || following != null) && (
                  <div className="flex justify-between gap-2 text-xs text-slate-500">
                    {followers != null && (
                      <span>
                        Người theo dõi: <b>{followers}</b>
                      </span>
                    )}
                    {following != null && (
                      <span>
                        Đang theo dõi: <b>{following}</b>
                      </span>
                    )}
                  </div>
                )}
                {user.banReason && user.status === "BANNED" && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Lý do cấm</span>
                    <span className="text-right font-medium text-rose-600">{user.banReason}</span>
                  </div>
                )}
                {user.deleteRequestedAt && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Yêu cầu xoá</span>
                    <span className="font-medium text-slate-700">{formatDateTime(user.deleteRequestedAt)}</span>
                  </div>
                )}
                {user.deleteEffectiveAt && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Xoá vào</span>
                    <span className="font-medium text-slate-700">{formatDateTime(user.deleteEffectiveAt)}</span>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          <button
            type="submit"
            form="user-detail-form"
            className="rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !user}
          >
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onBan?.()}
              disabled={!user || user.status === "BANNED" || saving}
              className="flex-1 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cấm người dùng
            </button>
            <button
              type="button"
              onClick={() => onDelete?.()}
              disabled={!user || user.status === "DELETED" || saving}
              className="flex-1 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
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

function createFormValues(user) {
  if (!user) {
    return {
      fullName: "",
      phoneNumber: "",
      email: "",
      avatarUrl: "",
      gender: "UNSPECIFIED",
      dateOfBirth: "",
      bio: "",
    };
  }

  return {
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || "",
    gender: user.gender || "UNSPECIFIED",
    dateOfBirth: formatDateInput(user.dateOfBirth),
    bio: user.bio || "",
  };
}

function formatDateInput(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const [datePart] = value.split("T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusLabel(status) {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    case "BANNED":
      return "Đã bị cấm";
    case "DELETED":
      return "Đã xoá";
    case "PENDING_DELETE":
      return "Chờ xoá";
    default:
      return status || "Không rõ";
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", { hour12: false });
}