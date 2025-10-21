import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

export default function Invoices() {
    return (
    <PageShell
      title="Hóa đơn & chứng từ"
      description="Theo dõi các hóa đơn phát hành cho chủ nhà và khách thuê."
    >
      <PageSection
        title="Tóm tắt hóa đơn"
        description="Các chỉ số chính về số lượng và trạng thái hóa đơn."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["Đã phát hành", "Chờ phát hành", "Đã thanh toán", "Quá hạn"].map((label) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">{label}</div>
              <div className="mt-2 inline-flex h-7 w-20 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
              <div className="mt-3 text-xs text-slate-400">Số liệu sẽ đồng bộ tự động từ hệ thống kế toán.</div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Danh sách hóa đơn"
        description="Tra cứu mã hóa đơn, khách hàng và tình trạng thanh toán."
      >
        <EmptyState
          title="Chức năng hóa đơn đang chờ cập nhật"
          description="Trang này sẽ sớm hiển thị danh sách hóa đơn chi tiết cùng khả năng tìm kiếm và xuất dữ liệu."
        />
      </PageSection>
    </PageShell>
  );
}