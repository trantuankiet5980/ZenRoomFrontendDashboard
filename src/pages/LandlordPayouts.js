import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import LandlordMonthlyPayoutsTable from "./invoices/LandlordMonthlyPayoutsTable";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { showToast } from "../utils/toast";
import { axiosInstance } from "../api/axiosInstance";
import {
  fetchAdminWallet,
  clearAdminWalletError,
} from "../redux/slices/adminWalletSlice";
import {
  fetchLandlordMonthlyPayouts,
  clearLandlordMonthlyPayoutsError,
} from "../redux/slices/landlordMonthlyPayoutsSlice";

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, idx) => CURRENT_YEAR - 3 + idx);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => idx + 1);

export default function LandlordPayouts() {
  const dispatch = useDispatch();
  const { wallet, transactions, status: walletStatus, error: walletError } = useSelector(
    (state) => state.adminWallet
  );
  const { summary, landlords, status: payoutsStatus, error: payoutsError } = useSelector(
    (state) => state.landlordMonthlyPayouts
  );

  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [detailState, setDetailState] = useState({ status: "idle", data: null, error: null });
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferDescription, setTransferDescription] = useState(
    `Thanh toán doanh thu tháng ${CURRENT_MONTH}`
  );
  const [transferStatus, setTransferStatus] = useState("idle");
  const [transferError, setTransferError] = useState(null);

  useEffect(() => {
    const promise = dispatch(fetchAdminWallet({ year, month }));
    return () => promise.abort?.();
  }, [dispatch, year, month]);

  useEffect(() => {
    const promise = dispatch(fetchLandlordMonthlyPayouts({ year, month }));
    return () => promise.abort?.();
  }, [dispatch, year, month]);

  useEffect(() => {
    if (walletStatus === "failed" && walletError) {
      showToast("error", walletError);
    }
  }, [walletStatus, walletError]);

  useEffect(() => {
    if (payoutsStatus === "failed" && payoutsError) {
      showToast("error", payoutsError);
    }
  }, [payoutsStatus, payoutsError]);

  useEffect(() => {
    return () => {
      dispatch(clearAdminWalletError());
      dispatch(clearLandlordMonthlyPayoutsError());
    };
  }, [dispatch]);

  useEffect(() => {
    setTransferDescription(`Thanh toán doanh thu tháng ${month}`);
  }, [month]);

  useEffect(() => {
    if (!selectedLandlord) return undefined;
    const controller = new AbortController();
    setDetailState({ status: "loading", data: null, error: null });

    axiosInstance
      .get(`/v1/invoices/stats/landlords/${selectedLandlord.landlordId}/monthly/bookings`, {
        params: { year, month },
        signal: controller.signal,
      })
      .then((response) => {
        setDetailState({ status: "succeeded", data: response.data, error: null });
      })
      .catch((error) => {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
        const message =
          error?.response?.data?.message || "Không thể tải chi tiết doanh thu của chủ nhà.";
        setDetailState({ status: "failed", data: null, error: message });
        showToast("error", message);
      });

      return () => controller.abort();
  }, [selectedLandlord, year, month]);

  const walletLoading = walletStatus === "loading";
  const payoutsLoading = payoutsStatus === "loading";

  const canTransfer = useMemo(() => {
    const now = new Date();
    const inWindow = now.getDate() >= 25 && now.getDate() <= 30;
    const isCurrentPeriod = now.getFullYear() === year && now.getMonth() + 1 === month;
    return inWindow && isCurrentPeriod;
  }, [month, year]);

  const transferDisabledReason = useMemo(() => {
    if (canTransfer) return "";
    return "Chức năng chuyển tiền chỉ mở từ ngày 25-30 của tháng hiện tại.";
  }, [canTransfer]);

  const handleYearChange = (event) => setYear(Number(event.target.value));
  const handleMonthChange = (event) => setMonth(Number(event.target.value));

  const handleReset = () => {
    setYear(CURRENT_YEAR);
    setMonth(CURRENT_MONTH);
  };

  const handleViewDetails = (landlord) => {
    setSelectedLandlord(landlord);
  };

  const handleTransfer = (landlord) => {
    setTransferTarget(landlord);
    setTransferAmount(landlord.landlordReceivable || 0);
    setTransferError(null);
  };

  const handleCloseDetails = () => {
    setSelectedLandlord(null);
    setDetailState({ status: "idle", data: null, error: null });
  };

 const handleSubmitTransfer = async () => {
    if (!transferTarget) return;
    if (!transferAmount || Number(transferAmount) <= 0) {
      setTransferError("Số tiền cần lớn hơn 0.");
      return;
    }

    setTransferStatus("loading");
    setTransferError(null);

    try {
      await axiosInstance.post("/v1/admin/wallet/transfer", {
        userId: transferTarget.landlordId,
        amount: Number(transferAmount),
        description: transferDescription || `Thanh toán doanh thu tháng ${month}`,
      });

      showToast("success", `Đã chuyển tiền cho ${transferTarget.landlordName}.`);
      setTransferTarget(null);
      setTransferStatus("idle");
      dispatch(fetchAdminWallet({ year, month }));
      dispatch(fetchLandlordMonthlyPayouts({ year, month }));
    } catch (error) {
      const message = error?.response?.data?.message || "Không thể thực hiện chuyển tiền.";
      setTransferStatus("idle");
      setTransferError(message);
      showToast("error", message);
    }
  };

  const totalLandlords = landlords.length;

  return (
    <PageShell
      title="Quản lý doanh thu"
      description="Theo dõi ví admin, doanh thu và chuyển tiền cho chủ nhà theo từng tháng."
    >
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Ví &amp; thanh toán</p>
            <h1 className="text-2xl font-bold text-slate-800">Ví admin</h1>
            <p className="text-sm text-slate-600">Quản lý số dư, giao dịch và chuyển tiền cho chủ nhà.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Số dư ví"
              value={wallet ? formatCurrency(wallet.balance) : "—"}
              hint={wallet?.updatedAt ? `Cập nhật: ${formatDateTime(wallet.updatedAt)}` : "Đang tải..."}
              loading={walletLoading}
            />
            <StatCard
              label="Tổng chi trả tháng"
              value={summary ? formatCurrency(summary.totalLandlordReceivable) : "—"}
              hint={`Phí nền tảng: ${formatCurrency(summary?.totalPlatformFee || 0)}`}
              loading={payoutsLoading}
            />
            <StatCard
              label="Số chủ nhà"
              value={totalLandlords.toLocaleString("vi-VN")}
              hint="Có dữ liệu trong tháng"
              loading={payoutsLoading}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Nạp tiền
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            Rút tiền
          </button>
          <button
            type="button"
            onClick={() => setShowTransactions(true)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Xem giao dịch
          </button>
        </div>
      </div>

      <PageSection title="Bộ lọc" description="Chọn tháng và năm cần xem.">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tháng
            <select
              value={month}
              onChange={handleMonthChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Tháng {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Năm
            <select
              value={year}
              onChange={handleYearChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thiết lập</span>
            <button
              type="button"
              onClick={handleReset}
             className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Lưu ý chuyển tiền</p>
            <p>Chỉ chuyển được từ ngày 25-30 của tháng hiện tại.</p>
          </div>
        </div>
      </PageSection>

      <PageSection
        title="Doanh thu chủ nhà theo tháng"
        description="Thống kê chi tiết doanh thu và số tiền cần chi trả cho từng chủ nhà."
        actions={
          <button
            type="button"
            disabled
            className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
            title="Tính năng đang phát triển"
          >
            Chuyển tất cả
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Tổng đã thu" value={formatCurrency(summary?.totalPaidAmount || 0)} />
          <SummaryCard label="Phí nền tảng" value={formatCurrency(summary?.totalPlatformFee || 0)} />
          <SummaryCard label="Cần trả chủ nhà" value={formatCurrency(summary?.totalLandlordReceivable || 0)} highlight />
        </div>

        <div className="mt-5">
          <LandlordMonthlyPayoutsTable
            landlords={landlords}
            loading={payoutsLoading}
            onViewDetails={handleViewDetails}
            onTransfer={handleTransfer}
            canTransfer={canTransfer}
            disabledReason={transferDisabledReason}
          />
        </div>
      </PageSection>

      <TransactionsModal
        open={showTransactions}
        onClose={() => setShowTransactions(false)}
        transactions={transactions}
        wallet={wallet}
        month={month}
        year={year}
        loading={walletLoading}
      />

      <BookingDetailModal
        open={Boolean(selectedLandlord)}
        onClose={handleCloseDetails}
        landlord={selectedLandlord}
        detailState={detailState}
      />

      <TransferModal
        open={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        landlord={transferTarget}
        amount={transferAmount}
        description={transferDescription}
        onAmountChange={setTransferAmount}
        onDescriptionChange={setTransferDescription}
        onSubmit={handleSubmitTransfer}
        loading={transferStatus === "loading"}
        error={transferError}
        disabled={!canTransfer}
        disabledReason={transferDisabledReason}
      />
    </PageShell>
  );
}

function StatCard({ label, value, hint, loading = false }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-800">
        {loading ? <span className="text-slate-400">Đang tải...</span> : value}
      </div>
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${
        highlight
          ? "border-emerald-100 bg-emerald-50 text-emerald-800"
          : "border-slate-100 bg-white text-slate-800"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function TransactionsModal({ open, onClose, transactions = [], wallet, month, year, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Giao dịch ví tháng {month}/{year}</h3>
            <p className="text-sm text-slate-500">
              Số dư hiện tại: {wallet ? formatCurrency(wallet.balance) : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="max-h-[480px] space-y-3 overflow-auto px-5 py-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500">Đang tải giao dịch...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-slate-500">Chưa có giao dịch trong tháng này.</p>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.transactionId}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                        txn.type === "MONEY_IN"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {txn.type === "MONEY_IN" ? "Nạp" : "Rút"}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(txn.amount)}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDateTime(txn.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{txn.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDetailModal({ open, onClose, landlord, detailState }) {
  if (!open) return null;
  const { status, data, error } = detailState;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{landlord?.landlordName}</h3>
            <p className="text-sm text-slate-500">Chi tiết hóa đơn chi trả</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="max-h-[520px] overflow-auto px-5 py-4">
          {status === "loading" ? (
            <p className="text-center text-sm text-slate-500">Đang tải dữ liệu...</p>
          ) : status === "failed" ? (
            <p className="text-center text-sm text-amber-700">{error}</p>
          ) : !data ? (
            <p className="text-center text-sm text-slate-500">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Tổng chủ nhà nhận" value={formatCurrency(data.totalLandlordReceivable || 0)} />
                <SummaryCard label="Phí nền tảng" value={formatCurrency(data.totalPlatformFee || 0)} />
                <SummaryCard label="Số hóa đơn" value={data.bookings?.length || 0} />
              </div>

              <div className="overflow-auto rounded-xl border border-slate-100 shadow-sm">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="bg-slate-50">
                    <tr>
                      <Th>#</Th>
                      <Th className="min-w-[160px]">Mã hóa đơn</Th>
                      <Th className="min-w-[200px]">Căn hộ/Phòng</Th>
                      <Th className="min-w-[120px] text-right">Tổng</Th>
                      <Th className="min-w-[120px] text-right">Phí nền tảng</Th>
                      <Th className="min-w-[140px] text-right">Chủ nhà nhận</Th>
                      <Th className="min-w-[120px] text-right">Ngày trả</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings?.length ? (
                      data.bookings.map((booking, index) => (
                        <tr key={booking.invoiceId} className="even:bg-slate-50/60">
                          <Td className="font-semibold text-slate-700">{index + 1}</Td>
                          <Td className="font-medium text-slate-800">{booking.invoiceNo}</Td>
                          <Td className="text-slate-700">{booking.propertyTitle}</Td>
                          <Td className="text-right font-medium text-slate-700">{formatCurrency(booking.total)}</Td>
                          <Td className="text-right font-medium text-amber-700">{formatCurrency(booking.platformFee)}</Td>
                          <Td className="text-right font-semibold text-emerald-700">{formatCurrency(booking.landlordReceivable)}</Td>
                          <Td className="text-right text-slate-600">{formatDate(booking.paidDate)}</Td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <Td colSpan={7} className="text-center text-sm text-slate-500">
                          Không có hóa đơn nào trong tháng.
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransferModal({
  open,
  onClose,
  landlord,
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
  loading,
  error,
  disabled,
  disabledReason,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Chuyển tiền cho chủ nhà</h3>
            <p className="text-sm text-slate-500">{landlord?.landlordName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Cần chuyển" value={formatCurrency(landlord?.landlordReceivable || 0)} highlight />
            <SummaryCard label="Đã thu" value={formatCurrency(landlord?.paidAmount || 0)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Số tiền chuyển</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => onAmountChange(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nội dung</label>
            <input
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder={`Thanh toán doanh thu tháng ${new Date().getMonth() + 1}`}
            />
            <p className="text-xs text-slate-500">Mặc định: Thanh toán doanh thu tháng hiện tại.</p>
          </div>

          {error ? <p className="text-sm text-amber-700">{error}</p> : null}
          {disabled ? (
            <p className="text-sm text-amber-700">{disabledReason}</p>
          ) : (
            <p className="text-xs text-slate-500">Chỉ chuyển từ ngày 25-30 của tháng hiện tại.</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || disabled}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Đang xử lý..." : "Xác nhận chuyển"}
            </button>
          </div>
        </div>
      </div>
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