import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
} from "../api/notifications";
import { useAuth } from "../auth/AuthContext";

function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
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
      setUnreadCount(data?.count || 0);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotifications() {
    if (!currentMode) return;

    try {
      const items = await getNotifications(currentMode);
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
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
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
        type="button"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-700" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              Notifications
            </h3>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <article
                  key={item.id}
                  className="border-b border-slate-100 px-4 py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {item.actor_photo_data_url ? (
                      <img
                        src={item.actor_photo_data_url}
                        alt={item.actor_name || "User"}
                        className="h-10 w-10 shrink-0 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-slate-100 text-sm font-semibold text-slate-700">
                        {(item.actor_name || item.title || "N")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {item.title || "Notification"}
                      </p>

                      <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                        {item.message || "You have a new notification."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}