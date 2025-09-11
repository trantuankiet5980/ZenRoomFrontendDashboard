import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../redux/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((s) => s.auth);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(loginThunk({ phoneNumber, password })).unwrap();
      // Đăng nhập OK -> quay về trang trước đó hoặc "/"
      const next = location.state?.from || "/";
      navigate(next, { replace: true });
    } catch (_) {
      // lỗi đã hiển thị qua 'error'
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number" required />
        <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        {error && <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>}
        <button type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
}
