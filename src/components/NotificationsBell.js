import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAllRead } from "../redux/slices/notificationsSlice";
import { Link, useLocation } from "react-router-dom";

export default function NotificationsBell() {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(s => s.notifications);
  const { accessToken } = useSelector(s => s.auth);

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();

  // 1) Load ngay khi mount
  useEffect(() => {
    if (accessToken) dispatch(fetchNotifications());
  }, [accessToken, dispatch]);

  // 2) Poll mỗi 30s (nhẹ nhàng), tắt khi không đăng nhập
  useEffect(() => {
    if (!accessToken) return;
    const id = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(id);
  }, [accessToken, dispatch]);

  // 3) Đóng dropdown khi click ra ngoài hoặc khi đổi route
  useEffect(() => {
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const onToggle = () => {
    // mở panel thì refresh 1 phát cho “cảm giác realtime”
    if (!open) dispatch(fetchNotifications());
    setOpen(o => !o);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={onToggle}
        className="relative rounded-full p-2 hover:bg-brandBg"
        aria-label="Thông báo"
      >
        <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.702 18 14.17V11
                   a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165
                   6 8.388 6 11v3.17c0 .532-.21 1.04-.595 1.425L4 17h5m6 0v1
                   a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] grid place-items-center rounded-full bg-red-500 text-white text-[10px] px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white border rounded-xl shadow-lg overflow-hidden z-40">
          <div className="px-3 py-2 flex items-center justify-between bg-slate-50 border-b">
            <span className="font-semibold text-slate-800">Thông báo</span>
            <div className="flex items-center gap-3">
              {loading && <span className="text-xs text-slate-500">Đang tải…</span>}
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-amber-700 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {items.length === 0 && (
              <div className="p-4 text-sm text-slate-500">Chưa có thông báo</div>
            )}

            {items.map(n => (
              <div key={n.notificationId} className={`p-3 ${n.isRead ? "bg-white" : "bg-amber-50/60"}`}>
                <div className="flex items-start gap-2">
                  {/* icon đơn giản; nếu sau này backend trả avatar người gửi thì thay bằng <img> */}
                  <div className="h-8 w-8 rounded-full bg-amber-200 grid place-items-center text-[11px] font-bold text-amber-900">
                    !
                  </div>

                  <div className="min-w-0">
                    <div className={`text-sm ${n.isRead ? "text-slate-700" : "text-slate-900 font-medium"}`}>
                      {n.title || "Thông báo"}
                    </div>

                    {n.message && (
                      <div className="text-[12px] text-slate-600 mt-0.5 line-clamp-2">
                        {n.message}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}
                    </div>

                    {n.redirectUrl && (
                      <div className="mt-1">
                        <Link
                          to={n.redirectUrl.startsWith("/") ? n.redirectUrl : "/"}
                          className="text-xs text-amber-700 hover:underline"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* chân panel: nút reload thủ công */}
          <div className="px-3 py-2 bg-white border-t">
            <button
              onClick={() => dispatch(fetchNotifications())}
              className="text-xs text-slate-600 hover:underline"
            >
              Tải lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
