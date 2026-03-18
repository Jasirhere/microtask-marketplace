import { useEffect, useRef, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
} from "../api/notifications";
import { useAuth } from "../auth/AuthContext";

function formatTimeAgo(dateString) {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hrs ago`;
  return `${days} days ago`;
}

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const currentMode = user?.current_mode;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!currentMode) return;

    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();

      if (open) {
        loadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentMode, open]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadUnreadCount() {
    if (!currentMode) return;

    try {
      const data = await getUnreadNotificationsCount(currentMode);
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotifications() {
    if (!currentMode) return;

    try {
      const items = await getNotifications(currentMode);
      setNotifications(items);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (!open) {
      await loadNotifications();

      if (unreadCount > 0 && currentMode) {
        try {
          await markAllNotificationsRead(currentMode);
          setUnreadCount(0);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-slate-50"
      >
        <span className="text-lg">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 rounded-2xl border bg-white shadow-xl">
          <div className="border-b px-4 py-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="border-b px-4 py-4 last:border-b-0">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatTimeAgo(item.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}