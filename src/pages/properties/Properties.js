import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchProperties, setStatus, setQ, setPage, setSize, setCreatedFrom, setCreatedTo,
  fetchPropertyById, clearDetail,
  updatePropertyStatus, deleteProperty,
} from "../../redux/slices/propertiesSlice";
import Filters from "./Filters";
import PropertiesTable from "./Table";
import DetailDrawer from "./DetailDrawer";
import RejectModal from "./RejectModal";

export default function Properties() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items, page, size, totalPages, totalElements,
    status, q, createdFrom, createdTo, loading,
    detail, detailLoading, actionLoadingId
  } = useSelector(s => s.properties);

  // fetch list khi params đổi
  useEffect(() => {
    dispatch(fetchProperties({ page, size, status, q, createdFrom, createdTo }));
  }, [dispatch, page, size, status, q, createdFrom, createdTo]);

  // debounce search local
  const [kw, setKw] = useState(q || "");
  useEffect(() => {
    const id = setTimeout(() => dispatch(setQ(kw.trim() || "")), 350);
    return () => clearTimeout(id);
  }, [kw, dispatch]);

   // === Highlight flow ===
  const incomingHL = location.state?.highlightId;
  const [highlightId, setHighlightId] = useState(null);
  // Nhận highlightId 1 lần rồi xóa state trên history
  useEffect(() => {
    if (!incomingHL) return;
    setHighlightId(incomingHL);

    // clear state để back/F5 không lặp lại
    navigate(location.pathname, { replace: true });
    // Bảo đảm tab và search không chặn item (tuỳ chọn):
    // dispatch(setStatus("")); dispatch(setQ(""));
  }, [incomingHL, navigate, location.pathname/*, dispatch*/]);

  // Khi items thay đổi, thử scroll tới hàng cần highlight
  useEffect(() => {
    if (!highlightId) return;
    const row = document.querySelector(`[data-rowid="${highlightId}"]`);
    if (row) {
      row.scrollIntoView({ block: "center", behavior: "smooth" });
      // remove hiệu ứng sau 2.5s
      const t = setTimeout(() => {
        row.classList.remove("ring-2", "ring-amber-400", "animate-pulse");
      }, 2500);
      return () => clearTimeout(t);
    } else if (!loading) {
      // Không thấy trong trang hiện tại -> mở drawer chi tiết như fallback
      dispatch(fetchPropertyById(highlightId));
      setOpenDetail(true);
    }
  }, [items, highlightId, loading, dispatch]);

  const pageInfo = useMemo(() => {
    const from = totalElements === 0 ? 0 : page * size + 1;
    const to = Math.min(totalElements, (page + 1) * size);
    return { from, to };
  }, [page, size, totalElements]);

  // detail drawer
  const [openDetail, setOpenDetail] = useState(false);
  const onView = (id) => { dispatch(fetchPropertyById(id)); setOpenDetail(true); };
  const closeDetail = () => { setOpenDetail(false); dispatch(clearDetail()); };

  // approve / reject
  const onApprove = async (row) =>
    dispatch(updatePropertyStatus({ propertyId: row.propertyId, status: "APPROVED" }));

  const [rejectTarget, setRejectTarget] = useState(null);
  const onReject = (row) => setRejectTarget(row);
  const doReject = async (reason) => {
    if (!rejectTarget) return;
    await dispatch(updatePropertyStatus({
      propertyId: rejectTarget.propertyId,
      status: "REJECTED",
      reason: reason?.trim() || undefined,
    }));
    setRejectTarget(null);
  };

  const onDelete = async (row) => {
    if (!window.confirm("Xoá bài đăng này?")) return;
    await dispatch(deleteProperty(row.propertyId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Bảng điều khiển bài đăng</p>
              <h1 className="text-3xl font-bold text-slate-800">Quản lý bài đăng</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Theo dõi trạng thái phê duyệt, tìm kiếm theo tiêu đề/mô tả/tòa/phòng và quản lý lịch đăng bài một cách trực quan.
              </p>
            </div>

            <div className="grid auto-cols-max gap-1 text-right text-xs text-slate-500 md:text-sm">
              <span>Tổng số bài đăng: <b className="text-slate-800">{totalElements}</b></span>
              <span>Đang hiển thị: <b className="text-slate-800">{pageInfo.from}</b>–<b className="text-slate-800">{pageInfo.to}</b></span>
            </div>
          </div>
        </div>
      </div>

      <Filters
        kw={kw}
        onKwChange={setKw}
        size={size}
        onSizeChange={(n) => dispatch(setSize(n))}
        status={status}
        onStatusChange={(st) => dispatch(setStatus(st))}
        createdFrom={createdFrom}
        createdTo={createdTo}
        onCreatedFromChange={(v) => dispatch(setCreatedFrom(v))}
        onCreatedToChange={(v) => dispatch(setCreatedTo(v))}
      />

      {/* Table */}
      <PropertiesTable
        items={items}
        loading={loading}
        page={page}
        size={size}
        totalPages={totalPages}
        totalElements={totalElements}
        pageInfo={pageInfo}
        onPageFirst={() => dispatch(setPage(0))}
        onPagePrev={() => dispatch(setPage(page - 1))}
        onPageNext={() => dispatch(setPage(page + 1))}
        onPageLast={() => dispatch(setPage(Math.max(totalPages - 1, 0)))}
        onView={onView}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
        actionLoadingId={actionLoadingId}
        highlightId={highlightId}
      />

      {/* Drawer chi tiết */}
      {openDetail && (
        <DetailDrawer
          open={openDetail}
          onClose={closeDetail}
          loading={detailLoading}
          data={detail}
        />
      )}

      {/* Modal từ chối */}
      {rejectTarget && (
        <RejectModal
          onCancel={() => setRejectTarget(null)}
          onConfirm={doReject}
        />
      )}
    </div>
  );
}
