import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview, fetchRevenue, fetchRecentBookings } from "../redux/slices/statsSlice";
import RevenueChart from "../components/RevenueChart";

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function RecentBookings({ rows }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b bg-slate-50 text-sm font-medium text-slate-700">Đặt phòng/Căn hộ gần đây</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Khách</th>
              <th className="px-3 py-2 text-left">Phòng</th>
              <th className="px-3 py-2 text-right">Tổng</th>
              <th className="px-3 py-2 text-right">Trạng thái</th>
              <th className="px-3 py-2 text-right">Tạo lúc</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((b) => (
              <tr key={b.bookingId} className="border-t">
                <td className="px-3 py-2">{String(b.bookingId).slice(0,8)}…</td>
                <td className="px-3 py-2">{b.tenantName || "—"}</td>
                <td className="px-3 py-2">{b.propertyTitle || "—"}</td>
                <td className="px-3 py-2 text-right">{(+b.totalPrice || 0).toLocaleString("vi-VN")}₫</td>
                <td className="px-3 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs
                    ${b.bookingStatus === "APPROVED" ? "bg-green-100 text-green-700"
                    : b.bookingStatus === "PENDING" ? "bg-amber-100 text-amber-700"
                    : b.bookingStatus === "REJECTED" ? "bg-red-100 text-red-700"
                    : b.bookingStatus === "COMPLETED" ? "bg-sky-100 text-sky-700"
                    : b.bookingStatus === "CANCELLED" ? "bg-neutral-200 text-neutral-700"
                    : "bg-slate-100 text-slate-700"}`}>
                    {b.bookingStatus}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {b.createdAt ? new Date(b.createdAt).toLocaleString("vi-VN") : "—"}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { overview = {}, revenue = [], recentBookings = [], loading = false } =
    useSelector((s) => s.stats || {});

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchRevenue({ days: 30 }));
    dispatch(fetchRecentBookings({ limit: 8 }));
  }, [dispatch]);
  const totalRevenue = Number(overview?.totalRevenue ?? 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ZenRoom Admin Dashboard</h1>
        <p className="text-slate-500">Tổng quan hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={overview.totalUsers ?? 0}
          hint={`Đang hoạt động: ${overview.activeUsers ?? 0}`}
        />
        <StatCard title="Chủ nhà (Landlords)" value={overview.landlords ?? 0} />
        <StatCard title="Khách thuê (Tenants)" value={overview.tenants ?? 0} />
        <StatCard title="Tổng doanh thu" value={totalRevenue.toLocaleString("vi-VN") + "₫"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Tổng bài đăng" value={overview.totalProperties ?? 0} />
        <StatCard title="Đã duyệt" value={overview.approvedProperties ?? 0} />
        <StatCard title="Chờ duyệt" value={overview.pendingProperties ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Tổng đặt phòng/căn hộ" value={overview.totalBookings ?? 0} />
        <StatCard title="Hoàn tất" value={overview.completedBookings ?? 0} />
        <StatCard title="Đã hủy" value={overview.cancelledBookings ?? 0} />
        <StatCard title="Hoàn tất / Hủy" value={`${overview.completedBookings} / ${overview.cancelledBookings}`} />
      </div>
      {/* Biểu đồ doanh thu */}
      <RevenueChart data={revenue} />

      {/* Revenue list (placeholder đơn giản) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium text-slate-700">Doanh thu 30 ngày</div>
        {revenue?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
            {revenue.map(r => (
              <div key={r.date} className="text-xs">
                <div className="font-semibold">{(Number(r.revenue)||0).toLocaleString("vi-VN")}₫</div>
                <div className="text-slate-400">{r.date}</div>
              </div>
            ))}
          </div>
        ) : <div className="text-slate-500 text-sm">Chưa có dữ liệu</div>}
      </div>

      <RecentBookings rows={recentBookings} />

      {loading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-white shadow px-3 py-2 text-sm text-slate-600 border">
          Đang tải dữ liệu…
        </div>
      )}
    </div>
  );
}
