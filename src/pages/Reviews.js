import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import EmptyState from "../components/EmptyState";

const reviewFilters = [
  { key: "all", label: "Tất cả" },
  { key: "positive", label: "Đánh giá tích cực" },
  { key: "neutral", label: "Trung lập" },
  { key: "negative", label: "Cần xử lý" },
];

export default function Reviews() {
    return (
    <PageShell
      title="Đánh giá & phản hồi"
      description="Lắng nghe ý kiến khách thuê để cải thiện chất lượng dịch vụ."
    >
      <PageSection
        title="Tổng quan đánh giá"
        description="Theo dõi điểm trung bình và xu hướng phản hồi của khách."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Điểm trung bình</div>
            <div className="mt-2 inline-flex h-7 w-24 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
            <div className="mt-3 text-xs text-slate-400">Trung bình 30 ngày gần đây.</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Số đánh giá mới</div>
            <div className="mt-2 inline-flex h-7 w-20 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
            <div className="mt-3 text-xs text-slate-400">Chưa xử lý phản hồi.</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Tỷ lệ phản hồi</div>
            <div className="mt-2 inline-flex h-7 w-16 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
            <div className="mt-3 text-xs text-slate-400">Tỷ lệ phản hồi trong 24h.</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Báo cáo tiêu cực</div>
            <div className="mt-2 inline-flex h-7 w-16 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
            <div className="mt-3 text-xs text-slate-400">Cần ưu tiên xử lý.</div>
          </div>
        </div>
      </PageSection>

      <PageSection
        title="Danh sách đánh giá"
        description="Lọc và trả lời đánh giá của khách thuê theo trạng thái."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            {reviewFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                disabled
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      >
        <EmptyState
          title="Chưa có đánh giá nào"
          description="Khi khách thuê để lại đánh giá, bạn có thể xem nội dung, đánh dấu đã xử lý hoặc phản hồi trực tiếp tại đây."
        />
      </PageSection>
    </PageShell>
  );
}