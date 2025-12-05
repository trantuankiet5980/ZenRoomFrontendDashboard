import { formatCurrency } from "../../utils/format";

export default function LandlordMonthlyPayoutsTable({
  landlords = [],
  loading = false,
  onViewDetails,
  onTransfer,
  canTransfer = false,
  disabledReason,
}) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-100 shadow-sm">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-slate-50">
          <tr>
            <Th className="sticky left-0 z-10 bg-slate-50">#</Th>
            <Th className="sticky left-12 z-10 min-w-[180px] bg-slate-50">Chủ nhà</Th>
            <Th className="min-w-[140px] text-right">Đã thu</Th>
            <Th className="min-w-[140px] text-right">Phí nền tảng</Th>
            <Th className="min-w-[160px] text-right">Chủ nhà nhận</Th>
            <Th className="min-w-[200px] text-right">Thao tác</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <Td colSpan={6} className="text-center text-slate-500">
                Đang tải dữ liệu...
              </Td>
            </tr>
          ) : landlords.length === 0 ? (
            <tr>
              <Td colSpan={6} className="text-center text-slate-500">
                Chưa có dữ liệu chi trả cho tháng này.
              </Td>
            </tr>
          ) : (
            landlords.map((item, index) => (
              <tr key={item.landlordId || `${item.landlordName}-${index}`} className="even:bg-amber-50/40">
                <Td className="sticky left-0 z-[5] bg-white font-semibold text-slate-700">{index + 1}</Td>
                <Td className="sticky left-12 z-[5] bg-white font-medium text-slate-800">
                  <div className="max-w-[200px] truncate" title={item.landlordName}>
                    {item.landlordName || "Không rõ tên"}
                  </div>
                </Td>
                <Td className="text-right font-medium text-slate-700">{formatCurrency(item.paidAmount)}</Td>
                <Td className="text-right font-medium text-amber-700">{formatCurrency(item.platformFee)}</Td>
                <Td className="text-right font-semibold text-emerald-700">{formatCurrency(item.landlordReceivable)}</Td>
                <Td className="text-right text-sm">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails?.(item)}
                      className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => onTransfer?.(item)}
                      disabled={!canTransfer}
                      className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      title={!canTransfer && disabledReason ? disabledReason : undefined}
                    >
                      Chuyển tiền
                    </button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      scope="col"
      className={`border-b border-slate-200 px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", colSpan }) {
  return (
    <td className={`border-b border-slate-100 px-4 py-3 text-sm ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}