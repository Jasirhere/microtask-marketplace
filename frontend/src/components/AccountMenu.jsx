import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AccountMenu({
  onMyProfile,
  onAccountSettings,
  onLogout,
  photoSrc,
  fallbackLabel = "U",
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const currentMode = user?.current_mode || "poster";

  const activeProfile =
    currentMode === "worker" ? user?.worker_profile : user?.poster_profile;

  const displayName =
    activeProfile?.name || user?.email?.split("@")[0] || "User";

  const displayEmail = user?.email || "";
  const roleLabel = currentMode === "worker" ? "Worker" : "Poster";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAction(action) {
    setOpen(false);
    action?.();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            {fallbackLabel}
          </div>
        )}

        <div className="hidden text-left sm:block">
          <p className="max-w-[130px] truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="text-xs text-slate-500">My Account</p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                {fallbackLabel}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">{displayEmail}</p>

              <span className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => handleAction(onMyProfile)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
            >
              <User className="h-5 w-5 text-blue-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  View My Profile
                </p>
                <p className="text-xs text-slate-500">See your public profile</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onAccountSettings)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
            >
              <Settings className="h-5 w-5 text-violet-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Account Settings
                </p>
                <p className="text-xs text-slate-500">Manage preferences</p>
              </div>
            </button>
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => handleAction(onLogout)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />

              <div>
                <p className="text-sm font-medium">Log Out</p>
                <p className="text-xs text-red-400">Sign out of account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}