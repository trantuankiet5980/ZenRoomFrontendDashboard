import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

// data: [{ date: 'YYYY-MM-DD', revenue: number }]
export default function RevenueChart({ data = [] }) {
  // đảm bảo số & sắp theo ngày
  const chartData = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    const normalized = arr.map(d => ({
      date: d.date,
      revenue: Number(d.revenue) || 0,
    }));
    // sort tăng dần theo date
    normalized.sort((a, b) => (a.date > b.date ? 1 : -1));
    return normalized;
  }, [data]);

  // nếu có 1 điểm, thêm 1 điểm 0 trước đó để Line nhìn đỡ “chấm đơn”
  const padded = useMemo(() => {
    if (chartData.length >= 2) return chartData;
    if (chartData.length === 1) {
      const only = chartData[0];
      return [
        { date: only.date, revenue: 0 },
        only,
      ];
    }
    return [];
  }, [chartData]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-slate-700">Doanh thu 30 ngày</div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={padded} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#475569" }}
              tickMargin={8}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#475569" }}
              tickFormatter={(v) => v.toLocaleString("vi-VN")}
              width={80}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString("vi-VN")}₫`, "Doanh thu"]}
              labelFormatter={(label) => `Ngày: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#fbb040" // màu chủ đạo
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
