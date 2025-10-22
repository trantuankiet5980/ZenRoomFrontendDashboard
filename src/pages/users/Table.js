import StatusBadge from "../../components/StatusBadge";
import { resolveAvatarUrl } from "../../utils/cdn";

const STATUS_HINTS = {
  ACTIVE: "Tài khoản đang hoạt động",
  INACTIVE: "Tài khoản đã bị vô hiệu hoá",
  BANNED: "Người dùng không thể đăng nhập",
  DELETED: "Tài khoản đã bị xoá khỏi hệ thống",
  PENDING_DELETE: "Đang chờ hoàn tất yêu cầu xoá",
};

export default function UsersTable({
  users = [],
  loading,
  page,
  size,
  totalPages,
  totalElements,
  pageInfo,
  createdSort,
  onPageFirst,
  onPagePrev,
  onPageNext,
  onPageLast,
  onToggleCreatedSort,
  onView,
  onEdit,
  onBan,
  onDelete,
}) {
  const showEmpty = !loading && (!users || users.length === 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onToggleCreatedSort?.()}
                  className="inline-flex items-center gap-1 text-left font-semibold uppercase tracking-wide text-slate-500 transition hover:text-amber-600"
                >
                  <span>Ngày tạo</span>
                  {renderCreatedSortIndicator(createdSort)}
                </button>
              </th>
              <th className="px-4 py-3">Đăng nhập cuối</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showEmpty && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không có người dùng nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {users.map((user) => {
              const avatarUrl = user.avatarUrl ? resolveAvatarUrl(user.avatarUrl) : null;
              return (
                <tr key={user.userId} className="hover:bg-amber-50/40">
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.fullName || "Người dùng"}
                          className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-200 text-base font-semibold text-amber-900">
                          {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="space-y-1 text-sm">
                        <div className="font-semibold text-slate-800">{user.fullName || "(Chưa cập nhật)"}</div>
                        <div className="text-xs text-slate-500">
                          {user.email && <div>{user.email}</div>}
                          {user.phoneNumber && <div>{user.phoneNumber}</div>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex w-fit rounded-full border border-slate-200 px-3 py-[2px] text-xs font-medium uppercase tracking-wide text-slate-500">
                      {user.roleName || "Không rõ"}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <StatusBadge status={user.status} />
                      <span className="text-xs text-slate-500">
                        {user.banReason && user.status === "BANNED"
                          ? user.banReason
                          : STATUS_HINTS[user.status] || "—"}
                      </span>
                      {user.deleteRequestedAt && (
                        <span className="text-[11px] text-slate-500">
                          Yêu cầu xoá: {formatDateTime(user.deleteRequestedAt)}
                        </span>
                      )}
                      {user.deleteEffectiveAt && (
                        <span className="text-[11px] text-slate-500">
                          Xoá vào: {formatDateTime(user.deleteEffectiveAt)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                    {formatDateTime(user.createdAt)}
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                    {formatDateTime(user.lastLogin)}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView?.(user)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60"
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit?.(user)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60"
                      >
                        Cập nhật
                      </button>
                      <button
                        type="button"
                        disabled={user.status === "BANNED"}
                        onClick={() => onBan?.(user)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cấm
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(user)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                      >
                        Xoá
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
              Hiển thị <b>{pageInfo.from}</b>–<b>{pageInfo.to}</b> / <b>{totalElements}</b> người dùng
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
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            « Đầu
          </button>
          <button
            type="button"
            disabled={page <= 0}
            onClick={onPagePrev}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp ›
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={onPageLast}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cuối »
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour12: false,
  });
}

function renderCreatedSortIndicator(state) {
  if (state === "ASC") {
    return (
      <span className="inline-flex items-center text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M5.22 12.78a.75.75 0 001.06 0L10 9.06l3.72 3.72a.75.75 0 101.06-1.06l-4.25-4.25a.75.75 0 00-1.06 0L5.22 11.72a.75.75 0 000 1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (state === "DESC") {
    return (
      <span className="inline-flex items-center text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M14.78 7.22a.75.75 0 00-1.06 0L10 10.94 6.28 7.22a.75.75 0 10-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M7 5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 5zm0 4a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 9zm0 4a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 13z" />
      </svg>
    </span>
  );
}