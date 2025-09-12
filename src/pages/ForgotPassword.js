import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp, resetPassword, setCountdown, resetForgotFlow } from "../redux/slices/authSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fp = useSelector((s) => s.auth.fp);

  // countdown tick mỗi 1s (nếu >0)
  useEffect(() => {
    if (fp.countdown <= 0) return;
    const t = setInterval(() => dispatch(setCountdown(fp.countdown - 1)), 1000);
    return () => clearInterval(t);
  }, [dispatch, fp.countdown]);

  useEffect(() => () => { dispatch(resetForgotFlow()); }, [dispatch]);

  const handleSendOTP = (e) => {
    e.preventDefault();
    const phone = e.target.phone.value.trim();
    if (!/^\d{9,12}$/.test(phone)) return;
    dispatch(sendOtp({ phoneNumber: phone }));
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const otp = e.target.otp.value.trim();
    if (!/^\d{4,6}$/.test(otp)) return;
    dispatch(verifyOtp({ phoneNumber: fp.phoneNumber, otp, sessionId: fp.sessionId }));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const pass = e.target.pass.value;
    const confirm = e.target.confirm.value;
    if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return;
    if (pass !== confirm) return;
    dispatch(resetPassword({
      phoneNumber: fp.phoneNumber,
      otp: fp.otp,
      newPassword: pass,
      sessionId: fp.sessionId
    })).then((res) => {
      if (res.type.endsWith("/fulfilled")) navigate("/login", { replace: true });
    });
  };

  const resendOTP = () => {
    if (fp.countdown > 0) return;
    dispatch(sendOtp({ phoneNumber: fp.phoneNumber }));
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-brandBg">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-7 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Quên mật khẩu</h1>
          <p className="text-slate-500 text-sm">
            Bước {fp.step}/3 — {fp.step === 1 ? "Nhập SĐT" : fp.step === 2 ? "Nhập OTP" : "Tạo mật khẩu mới"}
          </p>
        </div>

        {fp.step === 1 && (
          <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
              <input name="phone" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition" placeholder="VD: 0384xxxxxx" required />
            </div>
            <button type="submit" disabled={fp.sending} className="w-full rounded-xl bg-brandBtn text-slate-900 font-semibold py-2.5 shadow-brand disabled:opacity-70">
              {fp.sending ? "Đang gửi OTP..." : "Gửi OTP"}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-amber-800 hover:underline text-sm font-medium">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}

        {fp.step === 2 && (
          <form onSubmit={handleVerifyOTP} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Mã OTP</label>
              <input name="otp" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none tracking-widest text-center focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition" placeholder="• • • • • •" inputMode="numeric" maxLength={6} required />
            </div>
            <button type="submit" disabled={fp.verifying} className="w-full rounded-xl bg-brandBtn text-slate-900 font-semibold py-2.5 shadow-brand disabled:opacity-70">
              {fp.verifying ? "Đang xác minh..." : "Xác minh OTP"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{fp.countdown > 0 ? `Gửi lại sau ${fp.countdown}s` : "Chưa nhận được mã?"}</span>
              <button type="button" disabled={fp.countdown > 0} onClick={resendOTP} className="text-amber-800 font-medium disabled:opacity-60">
                Gửi lại OTP
              </button>
            </div>
          </form>
        )}

        {fp.step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Mật khẩu mới</label>
              <input name="pass" type="password" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition" placeholder="Tối thiểu 8 ký tự, gồm chữ và số" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nhập lại mật khẩu mới</label>
              <input name="confirm" type="password" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition" placeholder="Nhập lại để xác nhận" required />
            </div>
            <button type="submit" disabled={fp.resetting} className="w-full rounded-xl bg-brandBtn text-slate-900 font-semibold py-2.5 shadow-brand disabled:opacity-70">
              {fp.resetting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-amber-800 hover:underline text-sm font-medium">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
