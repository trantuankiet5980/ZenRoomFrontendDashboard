import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const PERIOD_OPTIONS = [
  { value: "DAY", label: "Theo ngày" },
  { value: "MONTH", label: "Theo tháng" },
  { value: "YEAR", label: "Theo năm" },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => idx + 1);

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}₫`;
}

export default function RevenueChart({
  summary,
  period,
  filters,
  onPeriodChange,
  onFilterChange,
  daysInMonth = 31,
  loading = false,
}) {
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const periodLabel = useMemo(() => {
    switch (summary?.period) {
      case "DAY":
        return "Theo ngày";
      case "MONTH":
        return "Theo tháng";
      case "YEAR":
        return "Theo năm";
      default:
        return null;
    }
  }, [summary?.period]);
  const breakdownItems = useMemo(() => {
    if (!summary) return [];
    if (period === "YEAR") {
      return Array.isArray(summary.monthlyBreakdown) ? summary.monthlyBreakdown : [];
    }
    return Array.isArray(summary.dailyBreakdown) ? summary.dailyBreakdown : [];
  }, [summary, period]);

  const chartData = useMemo(() => {
    if (!breakdownItems.length) return [];
    if (period === "YEAR") {
      return breakdownItems
        .map((item) => ({
          label: `T${item.month}`,
          tooltipLabel: `Tháng ${item.month}/${item.year}`,
          revenue: Number(item.revenue) || 0,
          sortValue: new Date(Number(item.year) || 0, (Number(item.month) || 1) - 1, 1).getTime(),
        }))
        .sort((a, b) => a.sortValue - b.sortValue);
    }

    return breakdownItems
      .map((item) => {
        const dateStr = item.date;
        let label = dateStr;
        let tooltipLabel = dateStr ? `Ngày ${dateStr}` : "";
        let sortValue = 0;
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (!Number.isNaN(parsed.getTime())) {
            const day = parsed.getDate();
            const month = parsed.getMonth() + 1;
            const year = parsed.getFullYear();
            label = `${day}/${month}`;
            tooltipLabel = `Ngày ${day}/${month}/${year}`;
            sortValue = parsed.getTime();
          }
        }
        return {
          label,
          tooltipLabel,
          revenue: Number(item.revenue) || 0,
          sortValue,
        };
      })
      .sort((a, b) => a.sortValue - b.sortValue);
  }, [breakdownItems, period]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const years = new Set();
    for (let offset = -4; offset <= 1; offset += 1) {
      years.add(current + offset);
    }
    if (summary?.year) years.add(summary.year);
    if (filters?.year) years.add(Number(filters.year));
    return Array.from(years)
      .filter((y) => y > 0)
      .sort((a, b) => a - b);
  }, [summary?.year, filters?.year]);

  const dayOptions = useMemo(() => (
    Array.from({ length: Number(daysInMonth) || 31 }, (_, idx) => idx + 1)
  ), [daysInMonth]);

  const selectedYear = Number(filters?.year) || summary?.year;
  const selectedMonth = Number(filters?.month) || summary?.month;
  const selectedDay = Number(filters?.day) || summary?.day;

  const breakdownList = useMemo(() => {
    if (!breakdownItems.length) return [];
    if (period === "YEAR") {
      return [...breakdownItems]
        .sort((a, b) => new Date(a.year || 0, (a.month || 1) - 1, 1) - new Date(b.year || 0, (b.month || 1) - 1, 1))
        .map((item) => ({
          key: `${item.year}-${item.month}`,
          label: `Tháng ${item.month}/${item.year}`,
          revenue: item.revenue,
        }));
    }
    return [...breakdownItems]
      .sort((a, b) => {
        const da = a.date ? new Date(a.date) : 0;
        const db = b.date ? new Date(b.date) : 0;
        return da - db;
      })
      .map((item) => ({
        key: item.date,
        label: item.date,
        revenue: item.revenue,
      }));
  }, [breakdownItems, period]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-700">Thống kê doanh thu</div>
          <div className="text-xs text-slate-500">Tổng: {formatCurrency(totalRevenue)}</div>
          {periodLabel ? (
            <div className="text-xs text-slate-400">Chế độ: {periodLabel}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPeriodChange?.(option.value)}
              className={`rounded-full border px-3 py-1 transition ${
                period === option.value
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              {option.label}
            </button>
          ))}

          <select
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
            value={selectedYear || ""}
            onChange={(e) => onFilterChange?.({ year: Number(e.target.value) })}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{`Năm ${year}`}</option>
            ))}
          </select>

          {(period === "MONTH" || period === "DAY") && (
            <select
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
              value={selectedMonth || ""}
              onChange={(e) => onFilterChange?.({ month: Number(e.target.value) })}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>{`Tháng ${month}`}</option>
              ))}
            </select>
          )}

          {period === "DAY" && (
            <select
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
              value={selectedDay || ""}
              onChange={(e) => onFilterChange?.({ day: Number(e.target.value) })}
            >
              {dayOptions.map((day) => (
                <option key={day} value={day}>{`Ngày ${day}`}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="h-72">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#475569" }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#475569" }}
                tickFormatter={(v) => v.toLocaleString("vi-VN")}
                width={80}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.tooltipLabel || ""}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#fbb040"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {loading ? "Đang tải dữ liệu doanh thu…" : "Chưa có dữ liệu"}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm font-medium text-slate-700">
          {period === "YEAR" ? "Doanh thu theo tháng" : "Doanh thu theo ngày"}
        </div>
        {breakdownList.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
            {breakdownList.map((item) => (
              <div key={item.key} className="text-xs">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            {loading ? "Đang tải dữ liệu doanh thu…" : "Chưa có dữ liệu"}
          </div>
        )}
      </div>
    </div>
  );
}
