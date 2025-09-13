import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProperties, setStatus, setQ, setPage, setSize,
  fetchPropertyById, clearDetail,
  updatePropertyStatus, deleteProperty,
} from "../../redux/slices/propertiesSlice";
import Filters from "./Filters";
import PropertiesTable from "./Table";
import DetailDrawer from "./DetailDrawer";
import RejectModal from "./RejectModal";

export default function Properties() {
  const dispatch = useDispatch();
  const {
    items, page, size, totalPages, totalElements,
    status, q, loading, error,
    detail, detailLoading, actionLoadingId
  } = useSelector(s => s.properties);

  // fetch list khi params đổi
  useEffect(() => {
    dispatch(fetchProperties({ page, size, status, q }));
  }, [dispatch, page, size, status, q]);

  // debounce search local
  const [kw, setKw] = useState(q || "");
  useEffect(() => {
    const id = setTimeout(() => dispatch(setQ(kw.trim() || "")), 350);
    return () => clearTimeout(id);
  }, [kw, dispatch]);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bài đăng</h1>
          <p className="text-slate-500">
            Lọc theo trạng thái & tìm kiếm theo tiêu đề/mô tả/tòa/phòng
          </p>
        </div>

        <Filters
          kw={kw}
          onKwChange={setKw}
          size={size}
          onSizeChange={(n) => dispatch(setSize(n))}
          status={status}
          onStatusChange={(st) => dispatch(setStatus(st))}
        />
      </div>

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
