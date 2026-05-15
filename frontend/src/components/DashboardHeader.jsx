import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { switchMode } from "../api/profile";
import { useAuth } from "../auth/AuthContext";
import { Bell } from "lucide-react";
import { useChatContext } from "../context/useChatContext";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
} from "../api/notifications";
import AccountMenu from "./AccountMenu";
import AccountSettingsModal from "./AccountSettingsModal";

export default function DashboardHeader() {
  const { user, reload, logout } = useAuth();
  const { unreadMessageCount } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [switchingMode, setSwitchingMode] = useState(false);

  const notificationRef = useRef(null);

  const posterPhoto = user?.poster_profile?.photo_data_url;
  const workerPhoto = user?.worker_profile?.photo_data_url;

  const activePhoto =
    user?.current_mode === "poster" ? posterPhoto : workerPhoto;

  const isOnChatPage = location.pathname === "/chat";
  const currentMode = user?.current_mode;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentMode) return;
    loadNotificationCount();
    loadNotifications();
  }, [currentMode]);

  useEffect(() => {
    function handleNotificationUpdate() {
      if (!currentMode) return;
      loadNotificationCount();
      loadNotifications();
    }

    window.addEventListener("notification-update", handleNotificationUpdate);
    return () =>
      window.removeEventListener(
        "notification-update",
        handleNotificationUpdate
      );
  }, [currentMode]);

  async function loadNotificationCount() {
    try {
      const data = await getUnreadNotificationCount(currentMode);
      setNotificationUnreadCount(data?.count || 0);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotifications() {
    try {
      const data = await getNotifications(currentMode);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleOpenNotifications() {
    const nextValue = !showNotifications;
    setShowNotifications(nextValue);

    if (nextValue) {
      await loadNotifications();

      try {
        await markNotificationsRead(currentMode);
        setNotificationUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleSwitchMode(nextMode) {
    try {
      setSwitchingMode(true);

      if (nextMode === "poster") {
        if (user?.poster_profile) {
          await switchMode("poster");
          await reload();
          navigate("/poster", { replace: true });
        } else {
          navigate("/setup/poster");
        }
      }

      if (nextMode === "worker") {
        if (user?.worker_profile) {
          await switchMode("worker");
          await reload();
          navigate("/worker/jobs", { replace: true });
        } else {
          navigate("/setup/worker");
        }
      }
    } catch (err) {
      console.error("Mode switch failed:", err);
    } finally {
      setSwitchingMode(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleMyProfile() {
    if (user?.current_mode === "worker") {
      navigate("/worker/profile");
      return;
    }

    navigate("/poster/profile");
  }

  function handleAfterDeactivate() {
    logout();
    navigate("/login");
  }

  function formatNotificationText(item) {
    if (item?.type === "NEW_APPLICATION") {
      return `${item.actor_name || "A worker"} applied for your job`;
    }

    if (item?.type === "APPLICATION_ACCEPTED") {
      return "Your application was accepted";
    }

    if (item?.type === "APPLICATION_REJECTED") {
      return "Your application was rejected";
    }

    if (item?.type === "NEW_REVIEW") {
      return item?.message || "You received a new review";
    }

    return item?.message || "New notification";
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:py-4">
          <button
            onClick={() =>
              navigate(
                user?.current_mode === "worker" ? "/worker/jobs" : "/poster"
              )
            }
            className="flex min-w-0 items-center gap-2 sm:gap-3"
            type="button"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
              T
            </div>

            <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl lg:text-3xl">
              TaskMarket
            </h1>
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:flex-nowrap lg:gap-5">
            <div className="flex shrink-0 rounded-2xl border bg-white p-1 shadow-sm">
              <button
                onClick={() => handleSwitchMode("poster")}
                disabled={switchingMode}
                className={`rounded-xl px-3 py-2 text-sm font-medium sm:px-5 ${
                  user?.current_mode === "poster"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
              >
                Poster
              </button>

              <button
                onClick={() => handleSwitchMode("worker")}
                disabled={switchingMode}
                className={`rounded-xl px-3 py-2 text-sm font-medium sm:px-5 ${
                  user?.current_mode === "worker"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
              >
                Worker
              </button>
            </div>

            {user?.current_mode === "worker" && (
              <nav className="order-last flex w-full items-center justify-end gap-3 sm:order-none sm:w-auto sm:gap-4">
                <button
                  onClick={() => navigate("/worker/jobs")}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                  type="button"
                >
                  Find Jobs
                </button>

                <button
                  onClick={() => navigate("/worker/my-jobs")}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                  type="button"
                >
                  My Jobs
                </button>
              </nav>
            )}

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() =>
                  navigate("/chat", {
                    state: { openUnread: true },
                  })
                }
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  unreadMessageCount > 0 && !isOnChatPage
                    ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                    : isOnChatPage
                    ? "border-slate-300 bg-slate-100 text-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                title="Messages"
                type="button"
              >
                <span className="text-lg">💬</span>

                {unreadMessageCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow">
                    {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleOpenNotifications}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
                  title="Notifications"
                  type="button"
                >
                  <Bell className="h-5 w-5 text-slate-700" />

                  {notificationUnreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow">
                      {notificationUnreadCount > 99
                        ? "99+"
                        : notificationUnreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-white p-3 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        Notifications
                      </h3>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="max-h-96 space-y-2 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                          >
                            {item.actor_photo_data_url ? (
                              <img
                                src={item.actor_photo_data_url}
                                alt={item.actor_name || "User"}
                                className="h-10 w-10 shrink-0 rounded-full border object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-slate-200 font-semibold text-slate-700">
                                {(item.actor_name || "U")[0]?.toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-medium text-slate-900">
                                {formatNotificationText(item)}
                              </p>

                              {item.job_title && (
                                <p className="mt-1 break-words text-xs text-slate-500">
                                  Job: {item.job_title}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <AccountMenu
                photoSrc={activePhoto}
                fallbackLabel={user?.email?.[0]?.toUpperCase() || "U"}
                onMyProfile={handleMyProfile}
                onAccountSettings={() => setShowSettings(true)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      <AccountSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onAfterDeactivate={handleAfterDeactivate}
      />
    </>
  );
}