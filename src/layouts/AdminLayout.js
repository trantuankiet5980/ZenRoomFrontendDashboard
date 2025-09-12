import { useEffect, useMemo, useState, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchProfile } from "../redux/slices/authSlice";
import logo from "../zenroom.png";
import NavContent from "../components/sidebar/NavContent";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fullName, avatarUrl, accessToken } = useSelector((s) => s.auth);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (accessToken) dispatch(fetchProfile());
  }, [accessToken, dispatch]);

  // đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    // data giả lập thông báo
  const notifications = [
    { id: 1, title: "Đặt phòng mới", message: "Tenant2 đã đặt phòng", isRead: false },
    { id: 2, title: "Phê duyệt phòng", message: "Bài đăng Phòng 35m² đã được duyệt", isRead: true },
  ];

  // Thu gọn toàn sidebar (desktop)
  const [collapsed, setCollapsed] = useState(false);
  // Drawer mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  // Accordion từng section
  const [openSec, setOpenSec] = useState({
    overview: true,
    users: true,
    properties: true,
    bookings: true,
    content: true,
  });
  const toggleSec = (key) => setOpenSec((s) => ({ ...s, [key]: !s[key] }));

  // Dropdown user menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const sidebarWidth = useMemo(() => (collapsed ? "w-16" : "w-64"), [collapsed]);
  const mainMarginLeftMd = useMemo(() => (collapsed ? "md:ml-16" : "md:ml-64"), [collapsed]);

  return (
    <div className="min-h-screen w-full bg-brandBg/50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="h-14 px-4 mx-auto max-w-screen-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* mobile open */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white hover:bg-slate-50"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="ZenRoom" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-slate-800">ZenRoom Admin</span>
            </Link>
            {/* collapse desktop */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden md:inline-flex items-center justify-center h-9 px-3 rounded-lg border bg-brandBg hover:bg-slate-50"
              aria-label="Collapse sidebar"
              title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              {collapsed ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M15 5l-7 7 7 7"/>
                </svg>
              )}
            </button>
            
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2" ref={notifRef}>
            {/* Notification */}
            <button
               onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-full p-2 hover:bg-brandBg"
              aria-label="Thông báo"
            >
              <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.702 18 14.17V11
                    a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165
                    6 8.388 6 11v3.17c0 .532-.21 1.04-.595 1.425L4 17h5m6 0v1
                    a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {/* Badge */}
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-20 top-12 w-80 bg-white border rounded-xl shadow-lg p-2 z-40">
                <h3 className="px-3 py-2 font-semibold text-slate-700">Thông báo</h3>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-3 py-2 text-sm ${n.isRead ? "text-slate-500" : "text-slate-800 font-medium"}`}>
                      <div>{n.title}</div>
                      <div className="text-xs">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border bg-brandBg px-2 py-1.5 hover:bg-slate-50"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover border" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-200 grid place-items-center text-xs font-semibold text-amber-900">
                    {(fullName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-sm text-slate-700">{fullName || "Admin"}</span>
                <svg viewBox="0 0 24 24" className={`h-4 w-4 text-slate-600 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-40"
                >
                  <div className="px-3 py-3 border-b bg-slate-50">
                    <div className="text-sm font-medium text-slate-800">{fullName || "Admin"}</div>
                    <div className="text-xs text-slate-500">Quản trị viên ZenRoom</div>
                  </div>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => { setUserMenuOpen(false); navigate("/profile"); }}
                    role="menuitem"
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => { setUserMenuOpen(false); dispatch(logout()); }}
                    role="menuitem"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar — desktop fixed */}
      <aside
        className={`hidden md:block fixed left-0 top-14 bottom-0 ${sidebarWidth} z-20
        border-r border-amber-100 bg-[#FFE3B8]/40`}
      >
        <div className="h-full overflow-y-auto p-2">
          <NavContent
            collapsed={collapsed}
            openSec={openSec}
            onToggle={(k) => setOpenSec((s) => ({ ...s, [k]: !s[k] }))}
          />
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        border-r border-amber-100 bg-[#FFE3B8]/90 backdrop-blur`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-amber-100 bg-[#FFE3B8]">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ZenRoom" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-slate-800">Menu</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border bg-white hover:bg-slate-50"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-2">
          <NavContent
            collapsed={false}
            openSec={openSec}
            onToggle={(k) => setOpenSec((s) => ({ ...s, [k]: !s[k] }))}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </aside>

      {/* overlay mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-20" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content — chừa lề trái theo sidebar desktop */}
      <main className={`px-4 py-4 mx-auto max-w-screen-2xl ${mainMarginLeftMd}`}>
        <Outlet />
      </main>
    </div>
  );
}
