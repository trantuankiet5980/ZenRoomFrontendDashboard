import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import UsersFilters from "./users/Filters";
import UsersTable from "./users/Table";
import UserDetailDrawer from "./users/DetailDrawer";
import ConfirmModal from "./users/ConfirmModal";
import { showToast } from "../utils/toast";
import {
  clearUsersError,
  fetchUsers,
  fetchUserById,
  updateUserById,
} from "../redux/slices/usersSlice";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState("");
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const selectedUserName = useMemo(() => {
    if (!detailUser) return "người dùng";
    return detailUser.fullName || detailUser.email || detailUser.phoneNumber || "người dùng";
  }, [detailUser]);

  const detailStatus = detailUser?.status;
  const isDetailBanned = detailStatus === "BANNED";
  const isDetailDeleted = detailStatus === "DELETED";
  const banModalTitle = isDetailBanned ? "Xác nhận hủy cấm người dùng" : "Xác nhận cấm người dùng";
  const banModalDescription = isDetailBanned
    ? `Bạn có chắc chắn muốn hủy cấm ${selectedUserName}? Tài khoản sẽ hoạt động trở lại sau khi hủy cấm.`
    : `Bạn có chắc chắn muốn cấm ${selectedUserName}? Người dùng sẽ không thể đăng nhập sau khi bị cấm.`;
  const banModalConfirmText = isDetailBanned ? "Hủy cấm" : "Cấm người dùng";
  const deleteModalTitle = isDetailDeleted ? "Xác nhận khôi phục tài khoản" : "Xác nhận xoá tài khoản";
  const deleteModalDescription = isDetailDeleted
    ? `Bạn có chắc chắn muốn khôi phục tài khoản của ${selectedUserName}? Tài khoản sẽ được mở lại ngay sau khi khôi phục.`
    : `Bạn có chắc chắn muốn xoá tài khoản của ${selectedUserName}? Hành động này không thể hoàn tác.`;
  const deleteModalConfirmText = isDetailDeleted ? "Khôi phục tài khoản" : "Xoá tài khoản";

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

  const refreshUsers = useCallback(() => {
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
    dispatch(fetchUsers(params));
  }, [dispatch, keyword, statusFilter, roles, fromDate, toDate, page, size, sortDirection]);

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
    if (!user) return;
    setDetailUserId(user.userId);
    setDetailUser(user);
    setDetailOpen(true);
  };

  const handleBan = (user) => {
    if (!user || user.status === "DELETED") return;
    setDetailUserId(user.userId);
    setDetailUser(user);
    setBanModalOpen(true);
  };

  const handleDelete = (user) => {
    if (!user) return;
    setDetailUserId(user.userId);
    setDetailUser(user);
    setDeleteModalOpen(true);
  };

  const handleToggleCreatedSort = () => {
    setPage(0);
    setCreatedSort((prev) => {
      if (prev === "DEFAULT") return "ASC";
      if (prev === "ASC") return "DESC";
      return "DEFAULT";
    });
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailUserId("");
    setDetailUser(null);
    setDetailLoading(false);
    setDetailSaving(false);
    setBanModalOpen(false);
    setDeleteModalOpen(false);
    setActionLoading(false);
  };

  useEffect(() => {
    if (!detailOpen || !detailUserId) return undefined;
    let ignore = false;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const data = await dispatch(fetchUserById(detailUserId)).unwrap();
        if (!ignore) {
          setDetailUser(data);
        }
      } catch (error) {
        if (!ignore) {
          showToast("error", error || "Không thể tải thông tin người dùng.");
        }
      } finally {
        if (!ignore) {
          setDetailLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      ignore = true;
    };
  }, [detailOpen, detailUserId, dispatch]);

  const handleSubmitDetail = async (values) => {
    if (!detailUserId) return;
    setDetailSaving(true);
    try {
      const payload = buildUpdatePayload(values);
      const updated = await dispatch(updateUserById({ userId: detailUserId, data: payload })).unwrap();
      const fallback = mapFormValuesToUser(values);
      setDetailUser((prev) => ({ ...(prev || {}), ...fallback, ...(updated || {}) }));
      showToast("success", "Cập nhật thông tin người dùng thành công.");
      refreshUsers();
    } catch (error) {
      showToast("error", error || "Không thể cập nhật thông tin người dùng.");
    } finally {
      setDetailSaving(false);
    }
  };

  const handleConfirmBan = async () => {
    if (!detailUserId) return;
    const isCurrentlyBanned = isDetailBanned;
    setActionLoading(true);
    try {
      const targetStatus = isCurrentlyBanned ? "ACTIVE" : "BANNED";
      const updated = await dispatch(
        updateUserById({ userId: detailUserId, data: { status: targetStatus } })
      ).unwrap();
      setDetailUser((prev) => ({
        ...(prev || {}),
        status: targetStatus,
        ...(targetStatus === "ACTIVE" ? { banReason: null } : {}),
        ...(updated || {}),
      }));
      showToast(
        "success",
        targetStatus === "BANNED" ? "Đã cấm người dùng thành công." : "Đã hủy cấm người dùng thành công."
      );
      refreshUsers();
      setBanModalOpen(false);
    } catch (error) {
      const fallbackMessage = isCurrentlyBanned
        ? "Không thể hủy cấm người dùng."
        : "Không thể cấm người dùng.";
      showToast("error", error || fallbackMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!detailUserId) return;
    const isCurrentlyDeleted = isDetailDeleted;
    setActionLoading(true);
    try {
      const targetStatus = isCurrentlyDeleted ? "ACTIVE" : "DELETED";
      const updated = await dispatch(
        updateUserById({ userId: detailUserId, data: { status: targetStatus } })
      ).unwrap();
      setDetailUser((prev) => ({
        ...(prev || {}),
        status: targetStatus,
        ...(updated || {}),
      }));
      showToast(
        "success",
        targetStatus === "DELETED" ? "Đã xoá tài khoản người dùng." : "Đã khôi phục tài khoản người dùng."
      );
      refreshUsers();
      setDeleteModalOpen(false);
    } catch (error) {
      const fallbackMessage = isCurrentlyDeleted
        ? "Không thể khôi phục tài khoản người dùng."
        : "Không thể xoá tài khoản người dùng.";
      showToast("error", error || fallbackMessage);
    } finally {
      setActionLoading(false);
    }
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
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Theo dõi trạng thái người dùng, tìm kiếm tên/số điện thoại/email và quản lý người dùng một cách trực quan.
              </p>
            </div>

            <div className="grid auto-cols-max gap-1 text-right text-xs text-slate-500 md:text-sm">
              <span>Tổng số người dùng: <b className="text-slate-800">{totalElements}</b></span>
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
            onBan={handleBan}
            onDelete={handleDelete}
          />
        </div>
      </PageSection>

      <UserDetailDrawer
        open={detailOpen}
        user={detailUser}
        loading={detailLoading}
        saving={detailSaving}
        onClose={handleCloseDetail}
        onSubmit={handleSubmitDetail}
        onBan={() => handleBan(detailUser)}
        onDelete={() => handleDelete(detailUser)}
      />

      <ConfirmModal
        open={banModalOpen}
        title={banModalTitle}
        description={banModalDescription}
        confirmText={banModalConfirmText}
        loading={actionLoading}
        onCancel={() => {
          setBanModalOpen(false);
          setActionLoading(false);
        }}
        onConfirm={handleConfirmBan}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title={deleteModalTitle}
        description={deleteModalDescription}
        confirmText={deleteModalConfirmText}
        loading={actionLoading}
        onCancel={() => {
          setDeleteModalOpen(false);
          setActionLoading(false);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageShell>
  );
}

function buildUpdatePayload(values = {}) {
  const payload = {};
  if ("fullName" in values) payload.fullName = normalizeTextInput(values.fullName);
  if ("phoneNumber" in values) payload.phoneNumber = normalizeTextInput(values.phoneNumber);
  if ("email" in values) payload.email = normalizeTextInput(values.email);
  if ("avatarUrl" in values) payload.avatarUrl = normalizeTextInput(values.avatarUrl);
  if ("gender" in values) payload.gender = values.gender || "UNSPECIFIED";
  if ("dateOfBirth" in values)
    payload.dateOfBirth = values.dateOfBirth ? `${values.dateOfBirth}T00:00:00` : null;
  if ("bio" in values) payload.bio = normalizeTextInput(values.bio);
  return payload;
}

function mapFormValuesToUser(values = {}) {
  const mapped = {};
  if ("fullName" in values) mapped.fullName = normalizeTextInput(values.fullName);
  if ("phoneNumber" in values) mapped.phoneNumber = normalizeTextInput(values.phoneNumber);
  if ("email" in values) mapped.email = normalizeTextInput(values.email);
  if ("avatarUrl" in values) mapped.avatarUrl = normalizeTextInput(values.avatarUrl);
  if ("gender" in values) mapped.gender = values.gender || "UNSPECIFIED";
  if ("dateOfBirth" in values)
    mapped.dateOfBirth = values.dateOfBirth ? `${values.dateOfBirth}T00:00:00` : null;
  if ("bio" in values) mapped.bio = normalizeTextInput(values.bio);
  return mapped;
}

function normalizeTextInput(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
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
  if (filters.fromDate) params.fromDate = normalizeDate(filters.fromDate);
  if (filters.toDate) params.toDate = normalizeDate(filters.toDate);

  return params;
}

function normalizeDate(value) {
  if (!value) return value;
  if (typeof value === "string") {
    const [datePart] = value.split("T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatAsDate(parsed);
    }

    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatAsDate(value);
  }
  return value;
}

function formatAsDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}