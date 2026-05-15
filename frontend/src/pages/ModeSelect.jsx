import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users, ArrowRight } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { switchMode } from "../api/profile";

export default function ModeSelect() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();

  const [loadingMode, setLoadingMode] = useState("");
  const [error, setError] = useState("");

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

    setError("");

    if (user.poster_profile) {
      try {
        setLoadingMode("poster");
        await switchMode("poster");
        await reload();
        navigate("/poster", { replace: true });
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.detail || "Failed to continue as poster");
      } finally {
        setLoadingMode("");
      }

      return;
    }

    navigate("/setup/poster", { replace: true });
  }

  async function handleWorker() {
    if (!user) return;

    setError("");

    if (user.worker_profile) {
      try {
        setLoadingMode("worker");
        await switchMode("worker");
        await reload();
        navigate("/worker/jobs", { replace: true });
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.detail || "Failed to continue as worker");
      } finally {
        setLoadingMode("");
      }

      return;
    }

    navigate("/setup/worker", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section className="w-full">
          <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xl font-bold text-white shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
              T
            </div>

            <h1 className="break-words bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              How would you like to start?
            </h1>

            <p className="mx-auto mt-3 max-w-2xl break-words text-sm leading-6 text-slate-600 sm:text-base lg:text-lg">
              Choose your role to continue. You can switch between modes anytime
              from your dashboard.
            </p>
          </header>

          {error && (
            <div className="mx-auto mb-5 max-w-2xl break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-8">
            <ModeCard
              icon={<Users className="h-8 w-8 sm:h-10 sm:w-10" />}
              title="Work as a Worker"
              description="Find job opportunities, showcase your skills, apply to relevant tasks, and build your reputation through reviews."
              points={[
                "Browse and apply for jobs",
                "Build your profile",
                "Chat after selection",
                "Earn reviews and ratings",
              ]}
              statusText={
                user?.worker_profile
                  ? "Worker profile found"
                  : "Worker profile not found — setup required"
              }
              buttonText={
                loadingMode === "worker" ? "Loading..." : "Continue as Worker"
              }
              disabled={loadingMode === "worker"}
              onClick={handleWorker}
              accent="worker"
            />

            <ModeCard
              icon={<Briefcase className="h-8 w-8 sm:h-10 sm:w-10" />}
              title="Work as a Poster"
              description="Post jobs, review applicants, select workers, manage work, and leave reviews after completion."
              points={[
                "Post jobs",
                "Review applications",
                "Select workers",
                "Rate and review workers",
              ]}
              statusText={
                user?.poster_profile
                  ? "Poster profile found"
                  : "Poster profile not found — setup required"
              }
              buttonText={
                loadingMode === "poster" ? "Loading..." : "Continue as Poster"
              }
              disabled={loadingMode === "poster"}
              onClick={handlePoster}
              accent="poster"
            />
          </div>

          <p className="mt-8 break-words text-center text-sm text-slate-500 sm:text-base">
            Not sure? You can always switch modes later from your dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  points,
  statusText,
  buttonText,
  disabled,
  onClick,
  accent,
}) {
  const styles =
    accent === "poster"
      ? {
          border: "group-hover:border-purple-500",
          glow: "from-purple-500 to-pink-600",
          icon: "from-purple-500 to-pink-600",
          bullet: "bg-purple-500",
          button: "from-purple-600 to-pink-600",
        }
      : {
          border: "group-hover:border-indigo-500",
          glow: "from-indigo-500 to-purple-600",
          icon: "from-indigo-500 to-purple-600",
          bullet: "bg-indigo-500",
          button: "from-indigo-600 to-purple-600",
        };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className="group min-w-0 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <article
        className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-xl transition-all duration-300 ${styles.border}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${styles.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
        />

        <div className="relative flex h-full min-w-0 flex-col p-5 text-center sm:p-7 lg:p-8">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white transition-transform duration-500 group-hover:rotate-12 sm:mb-6 sm:h-20 sm:w-20 ${styles.icon}`}
          >
            {icon}
          </div>

          <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
            {title}
          </h2>

          <p className="mt-3 flex-1 break-words text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base">
            {description}
          </p>

          <div className="mt-6 w-full space-y-3 sm:mt-8">
            {points.map((item) => (
              <div key={item} className="flex min-w-0 items-center text-left">
                <div
                  className={`mr-3 h-2 w-2 shrink-0 rounded-full ${styles.bullet}`}
                />

                <span className="min-w-0 break-words text-sm text-slate-700 sm:text-base">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 break-words text-center text-sm text-slate-500 sm:mt-8">
            {statusText}
          </div>

          <div
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:shadow-xl sm:py-4 sm:text-base ${styles.button}`}
          >
            <span className="min-w-0 break-words">{buttonText}</span>

            {!disabled && <ArrowRight className="h-4 w-4 shrink-0" />}
          </div>
        </div>
      </article>
    </button>
  );
}