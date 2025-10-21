import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

const skeleton = <span className="inline-flex h-7 w-16 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />;

const bookingStats = [
  { key: "total", title: "Tổng đơn đặt", hint: "Bao gồm cả căn hộ và phòng" },
  { key: "pending", title: "Đang chờ duyệt", hint: "Cần xử lý trong vòng 24h" },
  { key: "approved", title: "Đã duyệt", hint: "Sẵn sàng bàn giao" },
  { key: "cancelled", title: "Đã hủy", hint: "Bao gồm khách hủy và hệ thống hủy" },
];

export default function Bookings() {
      return (
    <PageShell
      title="Quản lý đặt phòng"
      description="Giám sát toàn bộ quy trình đặt phòng/căn hộ của khách trên ZenRoom."
      actions={(
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          disabled
        >
          Đồng bộ lịch (sắp ra mắt)
        </button>
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bookingStats.map((item) => (
          <div key={item.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{item.title}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-800">{skeleton}</div>
            <div className="mt-3 text-xs text-slate-400">{item.hint}</div>
          </div>
        ))}
      </div>

      <PageSection
        title="Bảng đặt phòng"
        description="Xem lịch sử giao dịch, tình trạng thanh toán và tiến độ bàn giao cho từng đơn đặt."
        actions={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              disabled
            >
              Bộ lọc nâng cao
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:opacity-50"
              disabled
            >
              Thêm đặt phòng
            </button>
          </div>
        )}
        padded={false}
      >
        <EmptyState
          title="Bảng đặt phòng đang trong quá trình phát triển"
          description="Chúng tôi sẽ sớm bổ sung bảng dữ liệu chi tiết cùng các bộ lọc theo trạng thái, phương thức thanh toán và ngày nhận phòng."
        />
      </PageSection>
    </PageShell>
  );
}