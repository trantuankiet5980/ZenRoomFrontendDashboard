import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import UserLogsFilters from "./logs/Filters";
import UserLogsTable from "./logs/Table";
import { fetchUserLogs, clearUserLogsError } from "../redux/slices/userLogsSlice";
import { formatDateInput } from "../utils/format";
import { showToast } from "../utils/toast";

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

export default function UserLogs() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.userLogs);

  const [filters, setFilters] = useState(createInitialFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [dateError, setDateError] = useState("");

  const logs = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const loading = status === "loading";

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

    const params = {
      page,
      size,
    };
    if (filters.fromDate) {
      params.fromDate = filters.fromDate;
    }
    if (filters.toDate) {
      params.toDate = filters.toDate;
    }

    const promise = dispatch(fetchUserLogs(params));
    return () => {
      promise.abort?.();
    };
  }, [dispatch, filters.fromDate, filters.toDate, page, size, dateError]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => () => {
    dispatch(clearUserLogsError());
  }, [dispatch]);

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
    setFilters(createInitialFilters());
  };

  const handleSizeChange = (value) => {
    setPage(0);
    setSize(value);
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
    setPage(totalPages - 1);
  };

  return (
    <PageShell title="Nhật ký quản trị người dùng" description="Theo dõi các thao tác quản trị liên quan đến tài khoản người dùng.">
      <PageSection title="Bộ lọc" description="Lọc nhật ký theo khoảng thời gian và số bản ghi hiển thị.">
        <UserLogsFilters
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          size={size}
          dateError={dateError}
          onDateChange={handleUpdateFilters}
          onSizeChange={handleSizeChange}
          onReset={handleResetFilters}
        />
      </PageSection>

      <PageSection title="Danh sách nhật ký" description="Các thao tác gần đây của quản trị viên.">
        <UserLogsTable
          logs={logs}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageInfo={pageInfo}
          onPageFirst={handlePageFirst}
          onPagePrev={handlePagePrev}
          onPageNext={handlePageNext}
          onPageLast={handlePageLast}
        />
      </PageSection>
    </PageShell>
  );
}