import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import ReportFilters from "./reports/Filters";
import ReportsTable from "./reports/Table";
import { formatDateInput } from "../utils/format";
import { showToast } from "../utils/toast";
import { fetchReports, clearReportsError } from "../redux/slices/reportsSlice";

const createInitialFilters = () => {
  const today = new Date();
  const toDate = formatDateInput(today);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return {
    fromDate: formatDateInput(monthAgo),
    toDate,
  };
};

export default function Reports() {
    const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.reports);
  const [filters, setFilters] = useState(createInitialFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sortDirection, setSortDirection] = useState("DESC");
  const [dateError, setDateError] = useState("");

  const { fromDate, toDate } = filters;
  const loading = status === "loading";

  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        setDateError("Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.");
        return;
      }
    }
    setDateError("");
  }, [fromDate, toDate]);

  useEffect(() => {
    if (dateError) return undefined;

    const params = {
      page,
      size,
      sort: sortDirection,
    };

    if (fromDate) {
      params.fromDate = formatDateInput(fromDate);
    }
    if (toDate) {
      params.toDate = formatDateInput(toDate);
    }

    const promise = dispatch(fetchReports(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, page, size, sortDirection, fromDate, toDate, dateError]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => () => {
    dispatch(clearReportsError());
  }, [dispatch]);

  const reports = useMemo(() => data.content ?? [], [data]);
  const totalPages = data.totalPages ?? 0;
  const totalElements = data.totalElements ?? 0;

  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const handleUpdateFilters = (key, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setPage(0);
    setSize(20);
    setSortDirection("DESC");
    setFilters(createInitialFilters());
  };

  const handleSizeChange = (value) => {
    setPage(0);
    setSize(value);
  };

  const handleToggleSort = () => {
    setPage(0);
    setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  const handlePageFirst = () => {
    if (page <= 0) return;
    setPage(0);
  };

  const handlePagePrev = () => {
    if (page <= 0) return;
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handlePageNext = () => {
    if (page >= totalPages - 1) return;
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handlePageLast = () => {
    if (page >= totalPages - 1) return;
    setPage(Math.max(totalPages - 1, 0));
  };

  return (
    <PageShell
      title="Báo cáo bài đăng"
      description="Theo dõi các báo cáo vi phạm được gửi bởi người dùng."
    >
      <PageSection title="Bộ lọc" description="Lọc báo cáo theo khoảng thời gian và số lượng hiển thị.">
        <ReportFilters
          fromDate={fromDate}
          toDate={toDate}
          size={size}
          dateError={dateError}
          onDateChange={handleUpdateFilters}
          onSizeChange={handleSizeChange}
          onReset={handleResetFilters}
        />
      </PageSection>

      <PageSection
        title="Danh sách báo cáo"
        description="Danh sách các bài đăng bị người dùng báo cáo."
      >
        {error && status === "failed" ? (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <ReportsTable
          reports={reports}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageInfo={pageInfo}
          sortDirection={sortDirection}
          onToggleSort={handleToggleSort}
          onPageFirst={handlePageFirst}
          onPagePrev={handlePagePrev}
          onPageNext={handlePageNext}
          onPageLast={handlePageLast}
        />
      </PageSection>
    </PageShell>
  );
}