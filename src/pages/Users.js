import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

const skeletonValue = <span className="inline-flex h-7 w-20 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />;

const stats = [
  { key: "total", title: "Tổng số người dùng", hint: "Bao gồm cả chủ nhà và khách thuê" },
  { key: "landlords", title: "Chủ nhà hoạt động", hint: "Đang có bài đăng hiển thị" },
  { key: "tenants", title: "Khách thuê hoạt động", hint: "Có lượt truy cập gần đây" },
  { key: "new", title: "Người dùng mới", hint: "Trong 30 ngày qua" },
];

export default function Users() {
    return (
    <PageShell
      title="Quản lý người dùng"
      description="Theo dõi và quản lý toàn bộ tài khoản trong hệ thống ZenRoom."
      actions={(
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-50"
          disabled
        >
          Xuất dữ liệu (sắp ra mắt)
        </button>
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{stat.title}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-800">{skeletonValue}</div>
            <div className="mt-3 text-xs text-slate-400">{stat.hint}</div>
          </div>
        ))}
      </div>

      <PageSection
        title="Danh sách người dùng"
        description="Bảng dữ liệu hiển thị thông tin chi tiết, trạng thái hoạt động và phân quyền của từng tài khoản."
        actions={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:opacity-50"
              disabled
            >
              Thêm người dùng
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              disabled
            >
              Nhập CSV
            </button>
          </div>
        )}
      >
        <EmptyState
          title="Bảng người dùng đang được hoàn thiện"
          description="Chúng tôi đang phát triển giao diện bảng để hiển thị, lọc và phân quyền người dùng. Vui lòng quay lại sau khi bản cập nhật mới được phát hành."
        />
      </PageSection>
    </PageShell>
  );
}