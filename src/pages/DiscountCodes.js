import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

const suggestions = [
  {
    key: "launch",
    title: "Ưu đãi ra mắt",
    description: "Giảm 20% cho người dùng mới trong 2 tuần đầu tiên.",
  },
  {
    key: "loyal",
    title: "Khách hàng thân thiết",
    description: "Giảm 15% cho khách đã đặt phòng từ 3 lần trở lên.",
  },
  {
    key: "longstay",
    title: "Đặt dài ngày",
    description: "Giảm 10% cho đơn đặt từ 14 đêm trở lên.",
  },
];

export default function DiscountCodes() {
    return (
    <PageShell
      title="Mã giảm giá"
      description="Thiết lập chương trình khuyến mãi và theo dõi hiệu quả sử dụng."
      actions={(
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:opacity-50"
          disabled
        >
          Tạo mã giảm giá
        </button>
      )}
    >
      <PageSection
        title="Gợi ý chiến dịch"
        description="Các kịch bản phổ biến giúp bạn khởi chạy chương trình ưu đãi nhanh chóng."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {suggestions.map((item) => (
            <div key={item.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="text-base font-semibold text-slate-800">{item.title}</div>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                disabled
              >
                Dùng mẫu này
              </button>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Danh sách mã giảm giá"
        description="Quản lý hạn sử dụng, số lần dùng và trạng thái kích hoạt của từng mã."
      >
        <EmptyState
          title="Chưa có mã giảm giá nào"
          description="Hãy tạo mã ưu đãi đầu tiên để thu hút thêm lượt đặt phòng cho hệ thống của bạn."
        />
      </PageSection>
    </PageShell>
  );
}