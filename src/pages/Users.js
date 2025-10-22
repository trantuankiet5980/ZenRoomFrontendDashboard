import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import UsersFilters from "./users/Filters";
import UsersTable from "./users/Table";
import UserDetailDrawer from "./users/DetailDrawer";
import { showToast } from "../utils/toast";
import { clearUsersError, fetchUsers } from "../redux/slices/usersSlice";

const skeletonValue = (
  <span className="inline-flex h-7 w-20 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
);

const INITIAL_FILTERS = {
  keyword: "",
  status: "ALL",
  fromDate: "",
  toDate: "",
};

export default function Users() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.users);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [dateError, setDateError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        setDateError("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
        return;
      }
    }
    setDateError("");
  }, [filters.fromDate, filters.toDate]);

  useEffect(() => {
    if (dateError) return undefined;
    const params = buildQueryParams({ filters, page, size, sortBy, sortDirection });
    const promise = dispatch(fetchUsers(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, filters.keyword, filters.status, filters.fromDate, filters.toDate, page, size, sortBy, sortDirection, dateError]);

  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      setHasFetchedOnce(true);
    }
  }, [status]);

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

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const loading = status === "loading";
  const hasLoaded = hasFetchedOnce;

  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const statusOverview = useMemo(() => {
    const counts = {};
    users.forEach((user) => {
      const key = user.status || "UNKNOWN";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [users]);

  const summaryCards = [
    {
      key: "total",
      title: "Tổng số người dùng",
      value: totalElements,
      hint: "Theo bộ lọc hiện tại",
    },
    {
      key: "active",
      title: "Đang hoạt động",
      value: statusOverview.ACTIVE || 0,
      hint: "Trong trang hiện tại",
    },
    {
      key: "banned",
      title: "Bị cấm",
      value: statusOverview.BANNED || 0,
      hint: "Trong trang hiện tại",
    },
    {
      key: "pending",
      title: "Đang xử lý xoá",
      value: (statusOverview.PENDING_DELETE || 0) + (statusOverview.DELETED || 0),
      hint: "Bao gồm đã xoá",
    },
  ];

  const showSkeleton = loading && !hasLoaded;

  const handleUpdateFilters = (patch) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setPage(0);
    setFilters(INITIAL_FILTERS);
    setSortBy("createdAt");
    setSortDirection("DESC");
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

  return (
    <PageShell
      title="Quản lý người dùng"
      description="Theo dõi và quản lý toàn bộ tài khoản trong hệ thống ZenRoom."
      actions={(
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-50"
          disabled
        >
          Xuất dữ liệu (sắp ra mắt)
        </button>
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{stat.title}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-800">
              {showSkeleton ? skeletonValue : formatNumber(stat.value)}
            </div>
            <div className="mt-3 text-xs text-slate-400">{stat.hint}</div>
          </div>
        ))}
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              disabled
            >
              Nhập CSV
            </button>
          </div>
        )}
      >
        <div className="space-y-6">
          <UsersFilters
            keyword={filters.keyword}
            status={filters.status}
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            sortBy={sortBy}
            sortDirection={sortDirection}
            size={size}
            onKeywordChange={(value) => handleUpdateFilters({ keyword: value })}
            onStatusChange={(value) => handleUpdateFilters({ status: value })}
            onDateChange={(field, value) => handleUpdateFilters({ [field]: value })}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
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
            sortBy={sortBy}
            sortDirection={sortDirection}
            onPageFirst={() => setPage(0)}
            onPagePrev={() => setPage((prev) => Math.max(prev - 1, 0))}
            onPageNext={() => setPage((prev) => (prev + 1 >= totalPages ? prev : prev + 1))}
            onPageLast={() => setPage(totalPages > 0 ? totalPages - 1 : 0)}
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

function formatNumber(value) {
  try {
    return new Intl.NumberFormat("vi-VN").format(value ?? 0);
  } catch (error) {
    return `${value ?? 0}`;
  }
}