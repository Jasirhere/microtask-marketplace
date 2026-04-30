import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { switchMode } from "../api/profile";
import { Briefcase, Users } from "lucide-react";

export default function ModeSelect() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const [loadingMode, setLoadingMode] = useState("");

  useEffect(() => {
    if (!user) return;

    const hasPoster = !!user.poster_profile;
    const hasWorker = !!user.worker_profile;

    if (hasPoster && hasWorker) return;

    if (hasPoster && !hasWorker) {
      navigate("/poster", { replace: true });
      return;
    }

    if (hasWorker && !hasPoster) {
      navigate("/worker/jobs", { replace: true });
      return;
    }
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            How would you like to start?
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose your role to continue. You can switch between modes anytime from your dashboard.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <button
            onClick={handleWorker}
            disabled={loadingMode === "worker"}
            type="button"
            className="group text-left transition hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-60"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-xl transition-all duration-300 group-hover:border-indigo-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

              <div className="relative flex h-full flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 transition-transform duration-500 group-hover:rotate-12">
                  <Users className="h-10 w-10 text-white" />
                </div>

                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Work as a Worker
                </h2>

                <p className="mb-8 flex-grow text-gray-600">
                  Find job opportunities, showcase your skills, apply to relevant tasks, and build your reputation through reviews.
                </p>

                <div className="mb-8 w-full space-y-3">
                  {[
                    "Browse and apply for jobs",
                    "Build your profile",
                    "Chat after selection",
                    "Earn reviews and ratings",
                  ].map((item) => (
                    <div key={item} className="flex items-center text-left">
                      <div className="mr-3 h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 text-sm text-gray-500">
                  {user?.worker_profile
                    ? "Worker profile found"
                    : "Worker profile not found — setup required"}
                </div>

                <div className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-center font-semibold text-white shadow-lg transition hover:shadow-xl">
                  {loadingMode === "worker" ? "Loading..." : "Continue as Worker"}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handlePoster}
            disabled={loadingMode === "poster"}
            type="button"
            className="group text-left transition hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-60"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-xl transition-all duration-300 group-hover:border-purple-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

              <div className="relative flex h-full flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 transition-transform duration-500 group-hover:rotate-12">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>

                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Work as a Poster
                </h2>

                <p className="mb-8 flex-grow text-gray-600">
                  Post jobs, review applicants, select workers, manage work, and leave reviews after completion.
                </p>

                <div className="mb-8 w-full space-y-3">
                  {[
                    "Post jobs",
                    "Review applications",
                    "Select workers",
                    "Rate and review workers",
                  ].map((item) => (
                    <div key={item} className="flex items-center text-left">
                      <div className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 text-sm text-gray-500">
                  {user?.poster_profile
                    ? "Poster profile found"
                    : "Poster profile not found — setup required"}
                </div>

                <div className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-center font-semibold text-white shadow-lg transition hover:shadow-xl">
                  {loadingMode === "poster" ? "Loading..." : "Continue as Poster"}
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-gray-500">
          Not sure? You can always switch modes later from your dashboard.
        </p>
      </div>
    </div>
  );
}