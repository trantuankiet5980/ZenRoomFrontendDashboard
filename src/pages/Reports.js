import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

const reportTemplates = [
  {
    key: "overview",
    title: "Báo cáo tổng quan",
    description: "Tổng hợp KPI chính của hệ thống theo tuần/tháng.",
  },
  {
    key: "finance",
    title: "Báo cáo tài chính",
    description: "Chi tiết doanh thu, công nợ và chi phí vận hành.",
  },
  {
    key: "inventory",
    title: "Báo cáo tồn kho",
    description: "Theo dõi tình trạng phòng trống và hiệu suất sử dụng.",
  },
];


export default function Reports() {
    return (
    <PageShell
      title="Báo cáo & phân tích"
      description="Tạo và tải về các báo cáo giúp bạn theo dõi hiệu quả kinh doanh."
      actions={(
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brandBtn px-4 py-2 text-sm font-semibold text-slate-900 shadow-brand transition hover:brightness-105 disabled:opacity-50"
          disabled
        >
          Xuất báo cáo
        </button>
      )}
    >
      <PageSection
        title="Mẫu báo cáo đề xuất"
        description="Chọn mẫu báo cáo phù hợp nhu cầu để xuất dữ liệu nhanh chóng."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {reportTemplates.map((item) => (
            <div key={item.key} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <div className="text-base font-semibold text-slate-800">{item.title}</div>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                disabled
              >
                Chọn mẫu
              </button>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Lịch sử báo cáo"
        description="Danh sách các báo cáo đã được tạo và thời điểm tải xuống."
      >
        <EmptyState
          title="Chưa có báo cáo nào được tạo"
          description="Sau khi bạn xuất báo cáo, lịch sử tải xuống sẽ xuất hiện tại đây để tiện quản lý."
        />
      </PageSection>
    </PageShell>
  );
}