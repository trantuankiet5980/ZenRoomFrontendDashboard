import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { accessToken } = useSelector((s) => s.auth);
  const location = useLocation();

  return accessToken
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
