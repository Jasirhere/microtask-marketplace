import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { switchMode } from "../api/profile";

export default function ModeSelect() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const [loadingMode, setLoadingMode] = useState("");

  useEffect(() => {
    if (!user) return;

    const hasPoster = !!user.poster_profile;
    const hasWorker = !!user.worker_profile;

    // If user has both profiles, let them choose every time
    if (hasPoster && hasWorker) {
      return;
    }

    // If user has only one profile, go directly there
    if (hasPoster && !hasWorker) {
      navigate("/poster");
      return;
    }

    if (hasWorker && !hasPoster) {
      navigate("/worker/jobs");
      return;
    }

    // If user has no profiles, stay here and let them choose
  }, [user, navigate]);

  async function handlePoster() {
    if (!user) return;

    if (user.poster_profile) {
      try {
        setLoadingMode("poster");
        await switchMode("poster");
        await reload();
        navigate("/poster");
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMode("");
      }
    } else {
      navigate("/setup/poster");
    }
  }

  async function handleWorker() {
    if (!user) return;

    if (user.worker_profile) {
      try {
        setLoadingMode("worker");
        await switchMode("worker");
        await reload();
        navigate("/worker/jobs");
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMode("");
      }
    } else {
      navigate("/setup/worker");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Choose how you want to continue
          </h1>
          <p className="text-slate-600 mt-2">
            Select your mode to continue using the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={handlePoster}
            disabled={loadingMode === "poster"}
            className="text-left bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Continue as Job Poster</h2>
            <p className="text-slate-600 mb-4">
              Post tasks, manage applicants, and hire workers.
            </p>
            <div className="text-sm text-slate-500">
              {user?.poster_profile
                ? "Poster profile found"
                : "Poster profile not found — setup required"}
            </div>
          </button>

          <button
            onClick={handleWorker}
            disabled={loadingMode === "worker"}
            className="text-left bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Continue as Job Worker</h2>
            <p className="text-slate-600 mb-4">
              Discover jobs, apply for tasks, and build your reputation.
            </p>
            <div className="text-sm text-slate-500">
              {user?.worker_profile
                ? "Worker profile found"
                : "Worker profile not found — setup required"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}