import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import logo from "../zenroom.png";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const { fullName } = useSelector(s => s.auth);
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-brandBg/50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(o => !o)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white hover:bg-slate-50"
              aria-label="Toggle menu"
            >
              {/* icon hamburger */}
              <svg viewBox="0 0 24 24" className="h-5 w-5"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="ZenRoom" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-slate-800">ZenRoom Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-600">
              {fullName || "Admin"}
            </span>
            <button
              onClick={() => dispatch(logout())}
              className="rounded-lg px-3 py-1.5 bg-brandBtn text-slate-900 font-medium hover:brightness-95 active:translate-y-px"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="mx-auto max-w-screen-2xl px-4 py-4 grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className={`${open ? "block" : "hidden"} md:block col-span-12 md:col-span-3 lg:col-span-2`}>
          <nav className="rounded-2xl border border-amber-100 bg-[#FFE3B8]/40 p-2">
            <Section title="Tổng quan">
              <Item to="/" label="Dashboard" />
            </Section>

            <Section title="Quản lý người dùng">
              <Item to="/users" label="Users" />
              <Item to="/roles" label="Roles" disabled />
              <Item to="/user-logs" label="Logs" disabled />
            </Section>

            <Section title="Bài đăng">
              <Item to="/properties" label="Properties" />
              <Item to="/moderations" label="Moderations" />
            </Section>

            <Section title="Đặt chỗ & Thu chi">
              <Item to="/bookings" label="Bookings" />
              <Item to="/contracts" label="Contracts" />
              <Item to="/invoices" label="Invoices" />
              <Item to="/payments" label="Payments" />
            </Section>

            <Section title="Tương tác & Nội dung">
              <Item to="/discount-codes" label="Discount Codes" />
              <Item to="/reviews" label="Reviews" />
              <Item to="/reports" label="Reports" />
            </Section>
          </nav>
        </aside>

        {/* Main content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */
function Section({ title, children }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-900/80">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Item({ to, label, disabled = false }) {
  if (disabled) {
    return (
      <div className="mx-1 px-3 py-2 text-sm rounded-xl text-slate-400 cursor-not-allowed border border-transparent">
        {label}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `mx-1 flex items-center gap-2 px-3 py-2 text-sm rounded-xl border
         ${isActive
           ? "bg-white border-amber-200 text-slate-900 shadow-sm"
           : "bg-transparent border-transparent text-slate-700 hover:bg-white/70 hover:border-amber-200"}`
      }
    >
      {/* dot icon */}
      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
      <span>{label}</span>
    </NavLink>
  );
}
