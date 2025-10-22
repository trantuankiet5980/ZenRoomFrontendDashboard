import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import RevenueChart from "../components/RevenueChart";
import InvoiceFilters from "./invoices/Filters";
import InvoiceTable from "./invoices/Table";
import InvoiceDetailDrawer from "./invoices/DetailDrawer";
import ConfirmModal from "./users/ConfirmModal";
import { fetchInvoices, refundInvoice, clearInvoicesError } from "../redux/slices/invoicesSlice";
import { fetchRevenueSummary } from "../redux/slices/statsSlice";
import { showToast } from "../utils/toast";
import { formatCurrency } from "../utils/format";

const createInitialFilters = () => ({
  status: "ALL",
  fromDate: "",
  toDate: "",
});

export default function Invoices() {
    const dispatch = useDispatch();
  const { data, status, error, actionLoadingId } = useSelector((state) => state.invoices);
  const { revenueSummary, revenueLoading } = useSelector((state) => state.stats);

  const [filters, setFilters] = useState(createInitialFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [dateError, setDateError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);

  const invoices = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const loading = status === "loading";
  const now = useMemo(() => new Date(), []);
  const [revenuePeriod, setRevenuePeriod] = useState("MONTH");
  const [revenueFilters, setRevenueFilters] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });

  useEffect(() => {
    const { fromDate, toDate } = filters;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        setDateError("Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.");
        return;
      }
    }
    setDateError("");
  }, [filters]);

  useEffect(() => {
    if (dateError) return undefined;
    const params = buildInvoiceQueryParams({ filters, page, size });
    const promise = dispatch(fetchInvoices(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, filters, page, size, dateError]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => () => {
    dispatch(clearInvoicesError());
  }, [dispatch]);

  useEffect(() => {
    if (!detailOpen || !selectedInvoiceId) return;
    const updated = invoices.find((item) => item.invoiceId === selectedInvoiceId);
    if (updated) {
      setSelectedInvoice(updated);
    }
  }, [detailOpen, selectedInvoiceId, invoices]);

  const daysInSelectedMonth = useMemo(() => {
    const year = Number(revenueFilters.year) || now.getFullYear();
    const month = Number(revenueFilters.month) || now.getMonth() + 1;
    return new Date(year, month, 0).getDate();
  }, [revenueFilters.year, revenueFilters.month, now]);

  useEffect(() => {
    if (revenuePeriod !== "DAY") return;
    setRevenueFilters((prev) => {
      const maxDay = daysInSelectedMonth;
      if (!prev.day || prev.day > maxDay) {
        return { ...prev, day: maxDay };
      }
      return prev;
    });
  }, [revenuePeriod, daysInSelectedMonth]);

  useEffect(() => {
    const params = {};
    if (revenuePeriod === "DAY") {
      const year = Number(revenueFilters.year) || now.getFullYear();
      const month = Number(revenueFilters.month) || now.getMonth() + 1;
      const day = Number(revenueFilters.day) || now.getDate();
      params.year = year;
      params.month = month;
      params.day = day;
    } else if (revenuePeriod === "MONTH") {
      const year = Number(revenueFilters.year) || now.getFullYear();
      const month = Number(revenueFilters.month) || now.getMonth() + 1;
      params.year = year;
      params.month = month;
    } else {
      params.year = Number(revenueFilters.year) || now.getFullYear();
    }
    dispatch(fetchRevenueSummary(params));
  }, [dispatch, revenuePeriod, revenueFilters.day, revenueFilters.month, revenueFilters.year, now]);

  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const pageTotals = useMemo(() => {
    return invoices.reduce(
      (acc, item) => {
        const total = Number(item.total) || 0;
        const due = Number(item.dueAmount) || 0;
        const paid = Math.max(0, total - due);
        return {
          total: acc.total + total,
          due: acc.due + due,
          paid: acc.paid + paid,
        };
      },
      { total: 0, due: 0, paid: 0 }
    );
  }, [invoices]);

  const handleUpdateFilters = (patch) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleStatusChange = (value) => {
    handleUpdateFilters({ status: value });
  };

  const handleDateChange = (field, value) => {
    handleUpdateFilters({ [field]: value });
  };

  const handleResetFilters = () => {
    setPage(0);
    setSize(20);
    setFilters(createInitialFilters());
  };

  const handleSizeChange = (value) => {
    setPage(0);
    setSize(value);
  };

  const handlePageFirst = () => setPage(0);
  const handlePagePrev = () => setPage((prev) => Math.max(prev - 1, 0));
  const handlePageNext = () => setPage((prev) => (prev + 1 >= totalPages ? prev : prev + 1));
  const handlePageLast = () => setPage(totalPages > 0 ? totalPages - 1 : 0);

  const handleView = (invoice) => {
    if (!invoice) return;
    setSelectedInvoiceId(invoice.invoiceId);
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedInvoiceId("");
    setSelectedInvoice(null);
  };

  const handleRefundClick = (invoice) => {
    if (!invoice) return;
    setRefundTarget(invoice);
    setRefundModalOpen(true);
  };

  const refreshInvoices = useCallback(() => {
    const params = buildInvoiceQueryParams({ filters, page, size });
    dispatch(fetchInvoices(params));
  }, [dispatch, filters, page, size]);

  const handleConfirmRefund = async () => {
    if (!refundTarget?.invoiceId) return;
    try {
      const action = await dispatch(refundInvoice({ invoiceId: refundTarget.invoiceId }));
      if (refundInvoice.fulfilled.match(action)) {
        showToast("success", "Đã xác nhận hoàn tiền cho hóa đơn.");
        setRefundModalOpen(false);
        setRefundTarget(null);
        refreshInvoices();
      } else {
        const message = action.payload || action.error?.message || "Không thể hoàn tiền hóa đơn.";
        showToast("error", message);
      }
    } catch (err) {
      showToast("error", err?.message || "Không thể hoàn tiền hóa đơn.");
    }
  };

  const handleCancelRefund = () => {
    setRefundModalOpen(false);
    setRefundTarget(null);
  };

  const handleRevenuePeriodChange = (value) => {
    setRevenuePeriod(value);
  };

  const handleRevenueFilterChange = (patch) => {
    setRevenueFilters((prev) => ({ ...prev, ...patch }));
  };

  const totalRevenue = Number(revenueSummary?.totalRevenue) || 0;

  const refundTitle = refundTarget
    ? `Xác nhận hoàn tiền hóa đơn ${refundTarget.invoiceNo || refundTarget.invoiceId}`
    : "Xác nhận hoàn tiền";
  const refundDescription = refundTarget
    ? `Bạn có chắc chắn muốn xác nhận đã hoàn tiền cho khách thuê ${
        refundTarget.tenantName || refundTarget.booking?.tenant?.fullName || ""
      }? Sau khi xác nhận, trạng thái hóa đơn sẽ chuyển sang "Đã hoàn tiền".`
    : "";

  return (
    <PageShell
      title="Quản lý hóa đơn"
      description="Theo dõi trạng thái phát hành, thanh toán và xử lý hoàn tiền hóa đơn."
    >
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Tổng quan hóa đơn</p>
            <h1 className="text-3xl font-bold text-slate-800">Tra cứu &amp; kiểm soát thanh toán</h1>
            <p className="text-sm text-slate-600">
              Lọc theo trạng thái, thời gian phát hành và nhanh chóng xử lý các yêu cầu hoàn tiền của khách thuê.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <HeroStat label="Tổng số hóa đơn" value={totalElements.toLocaleString("vi-VN")} hint="Tính theo bộ lọc hiện tại" />
            <HeroStat label="Doanh thu" value={formatCurrency(totalRevenue)} hint="Theo cấu hình thống kê" />
            <HeroStat label="Tổng tiền trang hiện tại" value={formatCurrency(pageTotals.total)} hint="Tổng cộng các hóa đơn đang hiển thị" />
          </div>
        </div>
      </div>

      <PageSection
        title="Thống kê doanh thu"
        description="Tham chiếu biểu đồ doanh thu từ bảng điều khiển để theo dõi biến động."
      >
        <RevenueChart
          summary={revenueSummary}
          period={revenuePeriod}
          filters={revenueFilters}
          onPeriodChange={handleRevenuePeriodChange}
          onFilterChange={handleRevenueFilterChange}
          daysInMonth={daysInSelectedMonth}
          loading={revenueLoading}
        />
      </PageSection>

      <PageSection
        title="Bộ lọc hóa đơn"
        description="Chọn trạng thái và khoảng thời gian phát hành để thu hẹp danh sách hóa đơn."
      >
        <InvoiceFilters
          status={filters.status}
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          size={size}
          dateError={dateError}
          onStatusChange={handleStatusChange}
          onDateChange={handleDateChange}
          onSizeChange={handleSizeChange}
          onReset={handleResetFilters}
        />
      </PageSection>

      <PageSection
        title="Danh sách hóa đơn"
        description="Danh sách chi tiết các hóa đơn phát hành cho chủ nhà và khách thuê."
      >
        <InvoiceTable
          invoices={invoices}
          loading={loading}
          page={page}
          size={size}
          totalPages={totalPages}
          totalElements={totalElements}
          pageInfo={pageInfo}
          actionLoadingId={actionLoadingId}
          onPageFirst={handlePageFirst}
          onPagePrev={handlePagePrev}
          onPageNext={handlePageNext}
          onPageLast={handlePageLast}
          onView={handleView}
          onRefund={handleRefundClick}
        />
      </PageSection>

      <InvoiceDetailDrawer open={detailOpen} invoice={selectedInvoice} onClose={handleCloseDetail} />

      <ConfirmModal
        open={refundModalOpen}
        title={refundTitle}
        description={refundDescription}
        confirmText="Xác nhận hoàn tiền"
        confirmVariant="primary"
        loading={actionLoadingId === refundTarget?.invoiceId}
        onCancel={handleCancelRefund}
        onConfirm={handleConfirmRefund}
      />
    </PageShell>
  );
}

function buildInvoiceQueryParams({ filters, page, size }) {
  const params = { page, size };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.fromDate) params.fromDate = normalizeDate(filters.fromDate);
  if (filters.toDate) params.toDate = normalizeDate(filters.toDate);
  return params;
}

function normalizeDate(value) {
  if (!value) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function HeroStat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-800">{value}</div>
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}