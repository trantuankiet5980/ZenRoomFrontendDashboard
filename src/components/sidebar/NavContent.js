import { NavLink } from "react-router-dom";

export default function NavContent({ collapsed, openSec, onToggle, onNavigate }) {
  const labelCls = collapsed ? "md:hidden" : "md:inline"; // ẩn label khi thu gọn

  return (
    <nav className="rounded-2xl border border-amber-100 bg-white/60 p-2">
      {/* Tổng quan */}
      <Section
        title="Tổng quan"
        collapsed={collapsed}
        open={openSec.overview}
        onToggle={() => onToggle("overview")}
      >
        <Item to="/" label="Thống kê" labelCls={labelCls} onNavigate={onNavigate} />
      </Section>

      {/* Quản lý người dùng */}
      <Section
        title="Quản lý người dùng"
        collapsed={collapsed}
        open={openSec.users}
        onToggle={() => onToggle("users")}
      >
        <Item to="/users" label="Người dùng" labelCls={labelCls} onNavigate={onNavigate} />
        <Item to="/chat" label="Nhắn tin" labelCls={labelCls} onNavigate={onNavigate} />
        {/* <Item to="/roles" label="Vai trò" labelCls={labelCls} disabled /> */}
        <Item to="/user-logs" label="Nhật ký hoạt động" labelCls={labelCls} onNavigate={onNavigate} />
      </Section>

      {/* Bài đăng */}
      <Section
        title="Quản lý bài đăng"
        collapsed={collapsed}
        open={openSec.properties}
        onToggle={() => onToggle("properties")}
      >
        <Item to="/properties" label="Bài đăng" labelCls={labelCls} onNavigate={onNavigate} />
      </Section>

      {/* Đặt chỗ & Thu chi */}
      <Section
        title="Đặt phòng/Căn hộ & Thu chi"
        collapsed={collapsed}
        open={openSec.bookings}
        onToggle={() => onToggle("bookings")}
      >
        {/* <Item to="/bookings" label="Đặt phòng" labelCls={labelCls} onNavigate={onNavigate} /> */}
        {/* <Item to="/contracts" label="Contracts" labelCls={labelCls} onNavigate={onNavigate} /> */}
        <Item to="/invoices" label="Hóa đơn" labelCls={labelCls} onNavigate={onNavigate} />
        {/* <Item to="/payments" label="Payments" labelCls={labelCls} onNavigate={onNavigate} /> */}
        <Item
          to="/landlord-payouts"
          label="Chi trả chủ nhà"
          labelCls={labelCls}
          onNavigate={onNavigate}
        />
      </Section>

      {/* Tương tác & Nội dung */}
      <Section
        title="Tương tác & Nội dung"
        collapsed={collapsed}
        open={openSec.content}
        onToggle={() => onToggle("content")}
      >
        {/* <Item to="/discount-codes" label="Mã giảm giá" labelCls={labelCls} onNavigate={onNavigate} /> */}
        {/* <Item to="/reviews" label="Reviews" labelCls={labelCls} onNavigate={onNavigate} /> */}
        <Item to="/reports" label="Báo cáo" labelCls={labelCls} onNavigate={onNavigate} />
      </Section>
    </nav>
  );
}

/* ===== Helpers (nội bộ NavContent) ===== */
function Section({ title, children, collapsed, open, onToggle }) {
  // Khi sidebar thu gọn (collapsed), chỉ hiện header; ẩn children
  const showChildren = !collapsed && open;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-2 py-2 rounded-lg
          ${collapsed ? "md:text-transparent md:select-none" : "text-amber-900/80"}
          hover:bg-[#FFE3B8]/50`}
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {title}
        </span>
        {!collapsed && (
          <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}>
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-200
          ${showChildren ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mt-1 space-y-1">{children}</div>
      </div>
    </div>
  );
}

function Item({ to, label, disabled = false, labelCls = "", onNavigate }) {
  if (disabled) {
    return (
      <div className="mx-1 px-3 py-2 text-sm rounded-xl text-slate-400 cursor-not-allowed border border-transparent flex items-center gap-2">
        <Dot />
        <span className={labelCls}>{label}</span>
      </div>
    );
  }
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        `mx-1 flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition
         ${isActive
           ? "bg-white border-amber-200 text-slate-900 shadow-sm"
           : "bg-transparent border-transparent text-slate-700 hover:bg-white/70 hover:border-amber-200"}`
      }
    >
      <Dot />
      <span className={labelCls}>{label}</span>
    </NavLink>
  );
}

function Dot() {
  return <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />;
}
