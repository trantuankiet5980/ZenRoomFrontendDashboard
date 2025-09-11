import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <button onClick={() => dispatch(logout())}>Logout</button>
    </div>
  );
}
