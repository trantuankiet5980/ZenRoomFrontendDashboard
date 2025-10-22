import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import DiscountCodeFilters from "./discount-codes/Filters";
import DiscountCodesTable from "./discount-codes/Table";
import DiscountCodeFormModal from "./discount-codes/FormModal";
import ConfirmModal from "./users/ConfirmModal";
import { showToast } from "../utils/toast";
import {
  clearDiscountCodesError,
  createDiscountCode,
  deleteDiscountCode,
  fetchDiscountCodes,
  updateDiscountCode,
} from "../redux/slices/discountCodesSlice";

const createInitialFilters = () => ({
  q: "",
  statuses: [],
  validFrom: "",
  validTo: "",
});

export default function DiscountCodes() {
    const dispatch = useDispatch();
  const [filters, setFilters] = useState(createInitialFilters);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [dateError, setDateError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { q, statuses, validFrom, validTo } = filters;

  const {
    data,
    status,
    error,
    creating,
    updatingId,
    deletingId,
    mutationError,
  } = useSelector((state) => state.discountCodes);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    if (validFrom && validTo) {
      const from = new Date(validFrom);
      const to = new Date(validTo);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        setDateError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
        return;
      }
    }
    setDateError("");
  }, [validFrom, validTo]);

  useEffect(() => {
    if (dateError) return undefined;
    const params = buildQueryParams({ q, statuses, validFrom, validTo, page, size });
    const promise = dispatch(fetchDiscountCodes(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, q, statuses, validFrom, validTo, page, size, dateError]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => {
    if (mutationError) {
      showToast("error", mutationError);
    }
  }, [mutationError]);

  useEffect(() => {
    return () => {
      dispatch(clearDiscountCodesError());
    };
  }, [dispatch]);

  const loading = status === "loading";
  const items = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const refreshList = useCallback(() => {
    if (dateError) return;
    const params = buildQueryParams({ q, statuses, validFrom, validTo, page, size });
    dispatch(fetchDiscountCodes(params));
  }, [dispatch, q, statuses, validFrom, validTo, page, size, dateError]);

  const handleOpenCreate = () => {
    setEditingCode(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (code) => {
    setEditingCode(code);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCode(null);
  };

  const handleSubmitForm = async (values) => {
    try {
      if (editingCode?.codeId) {
        const payload = { ...values, codeId: editingCode.codeId };
        await dispatch(updateDiscountCode(payload)).unwrap();
        showToast("success", "Cập nhật mã giảm giá thành công.");
      } else {
        await dispatch(createDiscountCode(values)).unwrap();
        showToast("success", "Tạo mã giảm giá mới thành công.");
      }
      handleCloseForm();
      refreshList();
    } catch (err) {
      showToast("error", err || "Không thể lưu mã giảm giá.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.codeId) return;
    try {
      await dispatch(deleteDiscountCode(deleteTarget.codeId)).unwrap();
      showToast("success", "Đã xoá mã giảm giá.");
      setDeleteTarget(null);
      refreshList();
    } catch (err) {
      showToast("error", err || "Không thể xoá mã giảm giá.");
    }
  };

  const handleSearchSubmit = () => {
    setPage(0);
    setFilters((prev) => ({ ...prev, q: searchInput.trim() }));
  };

  const handleStatusesChange = (next) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, statuses: next }));
  };

  const handleDateChange = (field, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(createInitialFilters());
    setSearchInput("");
    setPage(0);
    setSize(10);
  };

  const handleSizeChange = (value) => {
    setPage(0);
    setSize(value);
  };

  return (
    <PageShell>
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Chương trình khuyến mãi</p>
            <h1 className="text-3xl font-bold text-slate-800">Quản lý mã giảm giá</h1>
            <p className="text-sm text-slate-600">
              Theo dõi hiệu lực, số lần sử dụng và trạng thái của các mã ưu đãi dành cho khách hàng.
            </p>
          </div>
          <div className="grid auto-cols-max gap-1 text-right text-xs text-slate-500 md:text-sm">
            <span>
              Tổng số mã: <b className="text-slate-800">{totalElements}</b>
            </span>
            <span>
              Đang hiển thị: <b className="text-slate-800">{pageInfo.from}</b>–<b className="text-slate-800">{pageInfo.to}</b>
            </span>
          </div>
        </div>
      </div>
      <PageSection
        title="Bộ lọc tìm kiếm"
        description="Tìm nhanh mã giảm giá theo mã, mô tả, trạng thái và khoảng thời gian hiệu lực."
      >
        <div className="space-y-4">
          <DiscountCodeFilters
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            statuses={statuses}
            onStatusesChange={handleStatusesChange}
            validFrom={validFrom}
            validTo={validTo}
            onDateChange={handleDateChange}
            size={size}
            onSizeChange={handleSizeChange}
            onReset={handleResetFilters}
          />

          {dateError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{dateError}</div>
          ) : null}
        </div>
      </PageSection>

      <PageSection
        title="Danh sách mã giảm giá"
        description="Danh sách chi tiết mã, giá trị giảm và tình trạng sử dụng."
        actions={(
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Đang tạo…" : "Tạo mã giảm giá"}
          </button>
        )}
      >
        <div className="space-y-4">
          {status === "failed" && error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div>
          ) : null}

          <DiscountCodesTable
            items={items}
            loading={loading}
            page={page}
            size={size}
            totalPages={totalPages}
            totalElements={totalElements}
            pageInfo={pageInfo}
            updatingId={updatingId}
            deletingId={deletingId}
            onPageFirst={() => setPage(0)}
            onPagePrev={() => setPage((prev) => Math.max(prev - 1, 0))}
            onPageNext={() => setPage((prev) => (prev + 1 >= totalPages ? prev : prev + 1))}
            onPageLast={() => setPage(totalPages > 0 ? totalPages - 1 : 0)}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      </PageSection>

      <DiscountCodeFormModal
        open={formOpen}
        title={editingCode ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
        initialValues={editingCode}
        submitting={creating || (editingCode ? updatingId === editingCode.codeId : false)}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xoá mã giảm giá"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn xoá mã ${deleteTarget.code}? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xoá mã"
        loading={Boolean(deleteTarget && deletingId === deleteTarget.codeId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageShell>
  );
}

function buildQueryParams({ q, statuses, validFrom, validTo, page, size }) {
  const params = {
    page,
    size,
    sort: "validFrom,DESC",
  };

  if (q) params.q = q;
  if (Array.isArray(statuses) && statuses.length) params.statuses = statuses;
  if (validFrom) params.validFrom = validFrom;
  if (validTo) params.validTo = validTo;

  return params;
}