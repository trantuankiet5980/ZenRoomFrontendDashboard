import { useMemo } from "react";

const PERIOD_OPTIONS = [
  { value: "MONTH", label: "Theo tháng" },
  { value: "YEAR", label: "Theo năm" },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => idx + 1);

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function TopBookedProperties({
  data = [],
  period = "MONTH",
  filters = {},
  onPeriodChange,
  onFilterChange,
  loading = false,
}) {
  const now = useMemo(() => new Date(), []);
  const selectedYear = Number(filters?.year) || now.getFullYear();
  const selectedMonth = Number(filters?.month) || now.getMonth() + 1;

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const years = new Set();
    for (let offset = -4; offset <= 1; offset += 1) {
      years.add(current + offset);
    }
    if (filters?.year) years.add(Number(filters.year));
    return Array.from(years)
      .filter((y) => y > 0)
      .sort((a, b) => a - b);
  }, [filters?.year]);

  const totalBookings = useMemo(
    () => data.reduce((sum, item) => sum + (Number(item.bookingCount) || 0), 0),
    [data]
  );
  const totalBookedDays = useMemo(
    () => data.reduce((sum, item) => sum + (Number(item.totalBookedDays) || 0), 0),
    [data]
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-700">
            Top bất động sản được đặt nhiều nhất
          </div>
          <div className="text-xs text-slate-500">
            Tổng lượt đặt: {formatNumber(totalBookings)} • Tổng ngày đặt: {formatNumber(totalBookedDays)}
          </div>
          <div className="text-xs text-slate-400">
            Chế độ: {period === "MONTH" ? `Tháng ${selectedMonth}/${selectedYear}` : `Năm ${selectedYear}`}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPeriodChange?.(option.value)}
              className={`rounded-full border px-3 py-1 transition ${
                period === option.value
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {option.label}
            </button>
          ))}

          <select
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
            value={selectedYear}
            onChange={(e) => onFilterChange?.({ year: Number(e.target.value) })}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{`Năm ${year}`}</option>
            ))}
          </select>

          {period === "MONTH" && (
            <select
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
              value={selectedMonth}
              onChange={(e) => onFilterChange?.({ month: Number(e.target.value) })}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>{`Tháng ${month}`}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Bài đăng</th>
              <th className="px-3 py-2 text-left">Toà nhà</th>
              <th className="px-3 py-2 text-right">Giá/đêm</th>
              <th className="px-3 py-2 text-right">Lượt đặt</th>
              <th className="px-3 py-2 text-right">Tổng ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  Đang tải dữ liệu…
                </td>
              </tr>
            ) : data?.length ? (
              data.map((item, idx) => (
                <tr key={item.propertyId || idx}>
                  <td className="px-3 py-2 font-medium text-slate-600">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800">{item.propertyTitle || "—"}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{item.buildingName || "—"}</td>
                  <td className="px-3 py-2 text-right text-slate-800">
                    {`${formatNumber(item.pricePerNight)}₫`}
                  </td>
                  <td className="px-3 py-2 text-right text-sky-600 font-semibold">
                    {formatNumber(item.bookingCount)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">
                    {formatNumber(item.totalBookedDays)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}