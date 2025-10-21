import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview, fetchUserSummary, fetchRevenueSummary, fetchRecentBookings, fetchPostSummary } from "../redux/slices/statsSlice";
import UserStatsChart from "../components/UserStatsChart";
import RevenueChart from "../components/RevenueChart";
import PostStatsChart from "../components/PostStatsChart";

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
  const {
    overview = {},
    userSummary = {},
    userLoading = false,
    revenueSummary,
    revenueLoading = false,
    postSummary,
    postLoading = false,
    recentBookings = [],
    loading = false,
  } = useSelector((s) => s.stats || {});

  const now = useMemo(() => new Date(), []);
  const [userPeriod, setUserPeriod] = useState("MONTH");
  const [userFilters, setUserFilters] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
  const [period, setPeriod] = useState("MONTH");
  const [filters, setFilters] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
  const [postPeriod, setPostPeriod] = useState("MONTH");
  const [postFilters, setPostFilters] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });

  const userDaysInSelectedMonth = useMemo(() => {
    const year = Number(userFilters.year) || now.getFullYear();
    const month = Number(userFilters.month) || 1;
    return new Date(year, month, 0).getDate();
  }, [userFilters.year, userFilters.month, now]);

  const daysInSelectedMonth = useMemo(() => {
    const year = Number(filters.year) || now.getFullYear();
    const month = Number(filters.month) || 1;
    return new Date(year, month, 0).getDate();
  }, [filters.year, filters.month, now]);
  const postDaysInSelectedMonth = useMemo(() => {
    const year = Number(postFilters.year) || now.getFullYear();
    const month = Number(postFilters.month) || 1;
    return new Date(year, month, 0).getDate();
  }, [postFilters.year, postFilters.month, now]);

  useEffect(() => {
    if (userPeriod !== "DAY") return;
    setUserFilters((prev) => {
      const maxDay = userDaysInSelectedMonth;
      if (!prev.day || prev.day > maxDay) {
        return { ...prev, day: maxDay };
      }
      return prev;
    });
  }, [userDaysInSelectedMonth, userPeriod]);

  useEffect(() => {
    if (period !== "DAY") return;
    setFilters((prev) => {
      const maxDay = daysInSelectedMonth;
      if (!prev.day || prev.day > maxDay) {
        return { ...prev, day: maxDay };
      }
      return prev;
    });
  }, [daysInSelectedMonth, period]);
  useEffect(() => {
    if (postPeriod !== "DAY") return;
    setPostFilters((prev) => {
      const maxDay = postDaysInSelectedMonth;
      if (!prev.day || prev.day > maxDay) {
        return { ...prev, day: maxDay };
      }
      return prev;
    });
  }, [postDaysInSelectedMonth, postPeriod]);

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchRecentBookings({ limit: 8 }));
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (userPeriod === "DAY") {
      const year = Number(userFilters.year) || now.getFullYear();
      const month = Number(userFilters.month) || now.getMonth() + 1;
      const day = Number(userFilters.day) || now.getDate();
      params.day = day;
      params.month = month;
      params.year = year;
    } else if (userPeriod === "MONTH") {
      const year = Number(userFilters.year) || now.getFullYear();
      const month = Number(userFilters.month) || now.getMonth() + 1;
      params.month = month;
      params.year = year;
    } else {
      params.year = Number(userFilters.year) || now.getFullYear();
    }
    dispatch(fetchUserSummary(params));
  }, [dispatch, userPeriod, userFilters.day, userFilters.month, userFilters.year, now]);

  useEffect(() => {
    const params = {};
    if (period === "DAY") {
      const year = Number(filters.year) || now.getFullYear();
      const month = Number(filters.month) || now.getMonth() + 1;
      const day = Number(filters.day) || now.getDate();
      params.day = day;
      params.month = month;
      params.year = year;
    } else if (period === "MONTH") {
      const year = Number(filters.year) || now.getFullYear();
      const month = Number(filters.month) || now.getMonth() + 1;
      params.month = month;
      params.year = year;
    } else {
      params.year = Number(filters.year) || now.getFullYear();
    }
    dispatch(fetchRevenueSummary(params));
  }, [dispatch, period, filters.day, filters.month, filters.year, now]);
  useEffect(() => {
    const params = {};
    if (postPeriod === "DAY") {
      const year = Number(postFilters.year) || now.getFullYear();
      const month = Number(postFilters.month) || now.getMonth() + 1;
      const day = Number(postFilters.day) || now.getDate();
      params.day = day;
      params.month = month;
      params.year = year;
    } else if (postPeriod === "MONTH") {
      const year = Number(postFilters.year) || now.getFullYear();
      const month = Number(postFilters.month) || now.getMonth() + 1;
      params.month = month;
      params.year = year;
    } else {
      params.year = Number(postFilters.year) || now.getFullYear();
    }
    dispatch(fetchPostSummary(params));
  }, [dispatch, postPeriod, postFilters.day, postFilters.month, postFilters.year, now]);

  const handleUserFilterChange = (patch) => {
    setUserFilters((prev) => ({ ...prev, ...patch }));
  };
  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };
  const handlePostFilterChange = (patch) => {
    setPostFilters((prev) => ({ ...prev, ...patch }));
  };
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
      </div>
      {/* Thống kê người dùng */}
      <UserStatsChart
        summary={userSummary}
        period={userPeriod}
        filters={userFilters}
        onPeriodChange={setUserPeriod}
        onFilterChange={handleUserFilterChange}
        daysInMonth={userDaysInSelectedMonth}
        loading={userLoading}
      />
      
      {/* Biểu đồ doanh thu */}
      <RevenueChart
        summary={revenueSummary}
        period={period}
        filters={filters}
        onPeriodChange={setPeriod}
        onFilterChange={handleFilterChange}
        daysInMonth={daysInSelectedMonth}
        loading={revenueLoading}
      />

      {/* Thống kê bài đăng */}
      <PostStatsChart
        summary={postSummary}
        period={postPeriod}
        filters={postFilters}
        onPeriodChange={setPostPeriod}
        onFilterChange={handlePostFilterChange}
        daysInMonth={postDaysInSelectedMonth}
        loading={postLoading}
      />

      <RecentBookings rows={recentBookings} />

      {loading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-white shadow px-3 py-2 text-sm text-slate-600 border">
          Đang tải dữ liệu…
        </div>
      )}
    </div>
  );
}
