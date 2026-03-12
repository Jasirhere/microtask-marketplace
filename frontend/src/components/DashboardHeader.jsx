import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { switchMode } from "../api/profile";
import { useAuth } from "../auth/AuthContext";
import AccountMenu from "./AccountMenu";
import AccountSettingsModal from "./AccountSettingsModal";

export default function DashboardHeader() {
  const { user, reload, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const posterPhoto = user?.poster_profile?.photo_data_url;
  const workerPhoto = user?.worker_profile?.photo_data_url;

  const activePhoto =
    user?.current_mode === "poster" ? posterPhoto : workerPhoto;

  async function goToPoster() {
    try {
      if (user?.poster_profile) {
        await switchMode("poster");
        await reload();
        navigate("/poster");
      } else {
        navigate("/setup/poster");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function goToWorker() {
    try {
      if (user?.worker_profile) {
        await switchMode("worker");
        await reload();
        navigate("/worker/jobs");
      } else {
        navigate("/setup/worker");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleAfterDelete() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              T
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">TaskMarket</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex rounded-2xl border bg-white p-1 shadow-sm">
              <button
                onClick={goToPoster}
                className={`rounded-xl px-5 py-2 text-sm font-medium ${
                  user?.current_mode === "poster"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Poster
              </button>

              <button
                onClick={goToWorker}
                className={`rounded-xl px-5 py-2 text-sm font-medium ${
                  user?.current_mode === "worker"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Worker
              </button>
            </div>

            <AccountMenu
              photoSrc={activePhoto}
              fallbackLabel={user?.email?.[0]?.toUpperCase() || "U"}
              onAccountSettings={() => setShowSettings(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      <AccountSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onAfterDelete={handleAfterDelete}
      />
    </>
  );
}