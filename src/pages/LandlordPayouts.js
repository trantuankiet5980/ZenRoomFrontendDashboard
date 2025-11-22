import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import LandlordPayoutsTable from "./invoices/LandlordPayoutsTable";
import { fetchLandlordPayouts, clearLandlordPayoutsError } from "../redux/slices/landlordPayoutsSlice";
import { showToast } from "../utils/toast";
import { formatCurrency } from "../utils/format";

const PAGE_SIZES = [5, 10, 20, 50];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, idx) => CURRENT_YEAR - 3 + idx);

export default function LandlordPayouts() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.landlordPayouts);

  const [year, setYear] = useState(CURRENT_YEAR);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const payouts = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const loading = status === "loading";

  useEffect(() => {
    const promise = dispatch(fetchLandlordPayouts({ year, page, size }));
    return () => promise.abort?.();
  }, [dispatch, year, page, size]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast("error", error);
    }
  }, [status, error]);

  useEffect(() => () => {
    dispatch(clearLandlordPayoutsError());
  }, [dispatch]);

  const pageInfo = useMemo(() => {
    if (!totalElements) return { from: 0, to: 0 };
    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    return { from, to };
  }, [page, size, totalElements]);

  const monthlyTotals = useMemo(() => {
    if (!payouts.length) return [];
    const totals = new Array(12).fill(0);
    payouts.forEach((item) => {
      (item.monthlyPayouts || []).forEach((value, idx) => {
        totals[idx] += Number(value) || 0;
      });
    });
    return totals;
  }, [payouts]);

  const handleYearChange = (event) => {
    setPage(0);
    setYear(Number(event.target.value));
  };

  const handleSizeChange = (event) => {
    setPage(0);
    setSize(Number(event.target.value));
  };

  const handleReset = () => {
    setYear(CURRENT_YEAR);
    setPage(0);
    setSize(10);
  };

  const handlePageFirst = () => setPage(0);
  const handlePagePrev = () => setPage((prev) => Math.max(prev - 1, 0));
  const handlePageNext = () => setPage((prev) => (prev + 1 >= totalPages ? prev : prev + 1));
  const handlePageLast = () => setPage(totalPages > 0 ? totalPages - 1 : 0);

  const totalYearAmount = monthlyTotals.reduce((sum, value) => sum + value, 0);

  return (
    <PageShell
      title="Chi trả cho chủ nhà"
      description="Theo dõi tổng tiền chi trả cho từng chủ nhà theo 12 tháng trong năm."
    >
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Đặt phòng/Căn hộ &amp; Thu chi</p>
            <h1 className="text-2xl font-bold text-slate-800">Tổng hợp chi trả theo năm</h1>
            <p className="text-sm text-slate-600">
              Lọc theo năm để xem tổng số tiền chi trả 12 tháng cho tất cả chủ nhà.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Năm đang xem" value={year} hint="Chọn năm trong bộ lọc" />
            <StatCard label="Số chủ nhà" value={totalElements.toLocaleString("vi-VN")} hint="Tổng trong năm" />
            <StatCard label="Tổng chi trả (trang)" value={formatCurrency(totalYearAmount)} hint="Cộng 12 tháng của trang hiện tại" />
          </div>
        </div>
      </div>

      <PageSection title="Bộ lọc" description="Chọn năm và số bản ghi hiển thị.">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Năm
            <select
              value={year}
              onChange={handleYearChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Số bản ghi mỗi trang
            <select
              value={size}
              onChange={handleSizeChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              {PAGE_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option} bản ghi
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thiết lập</span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </PageSection>

      <PageSection
        title="Danh sách chi trả theo năm"
        description="Thống kê chi trả 12 tháng cho từng chủ nhà theo năm được chọn."
      >
        <LandlordPayoutsTable
          payouts={payouts}
          loading={loading}
          page={page}
          pageSize={size}
          totalPages={totalPages}
          totalElements={totalElements}
          pageInfo={pageInfo}
          monthlyTotals={monthlyTotals}
          onPageFirst={handlePageFirst}
          onPagePrev={handlePagePrev}
          onPageNext={handlePageNext}
          onPageLast={handlePageLast}
        />
      </PageSection>
    </PageShell>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-800">{value}</div>
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}