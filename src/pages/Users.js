import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import UsersFilters from "./users/Filters";
import UsersTable from "./users/Table";
import UserDetailDrawer from "./users/DetailDrawer";
import { showToast } from "../utils/toast";
import { clearUsersError, fetchUsers } from "../redux/slices/usersSlice";

const createInitialFilters = () => ({
  keyword: "",
  status: "ALL",
  roles: [],
  fromDate: "",
  toDate: "",
});

export default function Users() {
  const [filters, setFilters] = useState(createInitialFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [createdSort, setCreatedSort] = useState("DEFAULT");
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.users);
  const [dateError, setDateError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const { fromDate, toDate, keyword, status: statusFilter, roles } = filters;

  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        setDateError("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
        return;
      }
    }
    setDateError("");
  }, [fromDate, toDate]);

  const sortDirection = useMemo(() => {
    if (createdSort === "ASC") {
      return "ASC";
    }
    return "DESC";
  }, [createdSort]);

  useEffect(() => {
    if (dateError) return undefined;
    const params = buildQueryParams({
      filters: {
        keyword,
        status: statusFilter,
        roles,
        fromDate,
        toDate,
      },
      page,
      size,
      sortBy: "createdAt",
      sortDirection,
    });
    const promise = dispatch(fetchUsers(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, keyword, statusFilter, fromDate, toDate, roles, page, size, sortDirection, dateError]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => {
    return () => {
      dispatch(clearUsersError());
    };
  }, [dispatch]);

  const users = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const loading = status === "loading";
  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const handleUpdateFilters = (patch) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setPage(0);
    setFilters(createInitialFilters());
    setCreatedSort("DEFAULT");
    setSize(20);
  };

  const handleSizeChange = (value) => {
    setPage(0);
    setSize(value);
  };

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    showToast("info", "Chức năng cập nhật người dùng sẽ sớm ra mắt.");
  };

  const handleBan = (user) => {
    const name = user.fullName || user.email || "người dùng";
    const confirmed = window.confirm(`Bạn có chắc muốn cấm ${name}?`);
    if (!confirmed) return;
    showToast("warning", "Tính năng cấm người dùng đang được phát triển.");
  };

  const handleDelete = (user) => {
    const name = user.fullName || user.email || "người dùng";
    const confirmed = window.confirm(`Bạn có chắc muốn xoá ${name}?`);
    if (!confirmed) return;
    showToast("warning", "Tính năng xoá tài khoản đang được phát triển.");
  };

  const handleToggleCreatedSort = () => {
    setPage(0);
    setCreatedSort((prev) => {
      if (prev === "DEFAULT") return "ASC";
      if (prev === "ASC") return "DESC";
      return "DEFAULT";
    });
  };

  return (
    <PageShell
      title=""
      description=""
    >
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Bảng điều khiển người dùng</p>
              <h1 className="text-3xl font-bold text-slate-800">Quản lý người dùng</h1>
            </div>

            <div className="grid auto-cols-max gap-1 text-right text-xs text-slate-500 md:text-sm">
              <span>Tổng số bài đăng: <b className="text-slate-800">{totalElements}</b></span>
              <span>Đang hiển thị: <b className="text-slate-800">{pageInfo.from}</b>–<b className="text-slate-800">{pageInfo.to}</b></span>
            </div>
          </div>
        </div>
      </div>
      <PageSection
        title="Danh sách người dùng"
        description="Bảng dữ liệu hiển thị thông tin chi tiết, trạng thái hoạt động và phân quyền của từng tài khoản."
        actions={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:opacity-50"
              disabled
            >
              Thêm người dùng
            </button>
          </div>
        )}
      >
        <div className="space-y-6">
          <UsersFilters
            keyword={filters.keyword}
            status={filters.status}
            roles={filters.roles}
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            size={size}
            onKeywordChange={(value) => handleUpdateFilters({ keyword: value })}
            onStatusChange={(value) => handleUpdateFilters({ status: value })}
            onRolesChange={(value) => handleUpdateFilters({ roles: value })}
            onDateChange={(field, value) => handleUpdateFilters({ [field]: value })}
            onSizeChange={handleSizeChange}
            onReset={handleResetFilters}
          />

          {dateError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{dateError}</div>
          )}

          {status === "failed" && error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
          )}

          <UsersTable
            users={users}
            loading={loading}
            page={page}
            size={size}
            totalPages={totalPages}
            totalElements={totalElements}
            pageInfo={pageInfo}
            createdSort={createdSort}
            onPageFirst={() => setPage(0)}
            onPagePrev={() => setPage((prev) => Math.max(prev - 1, 0))}
            onPageNext={() => setPage((prev) => (prev + 1 >= totalPages ? prev : prev + 1))}
            onPageLast={() => setPage(totalPages > 0 ? totalPages - 1 : 0)}
            onToggleCreatedSort={handleToggleCreatedSort}
            onView={handleView}
            onEdit={handleEdit}
            onBan={handleBan}
            onDelete={handleDelete}
          />
        </div>
      </PageSection>

      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEdit={handleEdit}
        onBan={handleBan}
        onDelete={handleDelete}
      />
    </PageShell>
  );
}

function buildQueryParams({ filters, page, size, sortBy, sortDirection }) {
  const params = {
    page,
    size,
    sortBy,
    sortDirection,
  };

  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.roles?.length) params.roles = filters.roles.join(",");
  if (filters.fromDate) params.fromDate = normalizeDate(filters.fromDate, false);
  if (filters.toDate) params.toDate = normalizeDate(filters.toDate, true);

  return params;
}

function normalizeDate(value, endOfRange) {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T${endOfRange ? "23:59:59" : "00:00:00"}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:${endOfRange ? "59" : "00"}`;
  }
  return value;
}