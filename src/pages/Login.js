import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../redux/slices/authSlice";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import logo from "../zenroom.png";

import { showToast } from "../utils/toast";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((s) => s.auth);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginThunk({ phoneNumber, password })).unwrap();
      showToast("success", "Đăng nhập thành công!");
      const next = location.state?.from || "/";
      navigate(next, { replace: true });
    } catch {
      showToast("error", error || "Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-brandBg relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brandBtn/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brandBtn/10 blur-3xl" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-7 shadow-xl">
        <div className="text-center">
          <img
            src={logo}
            alt="Logo"
            className="mx-auto h-24 w-24 object-contain"
          />
          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="VD: 0384xxxxxx"
              inputMode="tel"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <div className="relative mt-1">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-20 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 hover:bg-slate-100"
                aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPass ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-xl bg-brandBtn text-slate-900 font-semibold py-2.5 shadow-brand hover:brightness-95 active:translate-y-[1px] transition disabled:opacity-70 disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-amber-800 hover:underline text-sm font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}
