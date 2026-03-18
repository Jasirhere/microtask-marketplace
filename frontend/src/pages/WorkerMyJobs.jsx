import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWorkerJobs } from "../api/applications";
import DashboardHeader from "../components/DashboardHeader";

function formatTimeAgo(dateString) {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

const STATUS_STYLES = {
  APPLIED: "bg-blue-100 text-blue-700",
  SELECTED: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-700",
};

export default function WorkerMyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("APPLIED");

  useEffect(() => {
    loadWorkerJobs();
  }, []);

  async function loadWorkerJobs() {
    try {
      setLoading(true);
      setError("");
      const data = await getMyWorkerJobs();
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  const appliedJobs = useMemo(
    () => jobs.filter((item) => item.application_status === "APPLIED"),
    [jobs]
  );

  const activeJobs = useMemo(
    () => jobs.filter((item) => item.application_status === "SELECTED"),
    [jobs]
  );

  const completedJobs = useMemo(
    () =>
      jobs.filter(
        (item) =>
          item.application_status === "REJECTED" ||
          item.application_status === "WITHDRAWN"
      ),
    [jobs]
  );

  const visibleJobs =
    activeTab === "ACTIVE"
      ? activeJobs
      : activeTab === "APPLIED"
        ? appliedJobs
        : completedJobs;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">My Jobs</h1>
          <p className="mt-2 text-lg text-slate-600">
            Track your applications, active jobs, and completed work
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">Applications</p>
            <p className="mt-2 text-4xl font-bold">{appliedJobs.length}</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">Active Jobs</p>
            <p className="mt-2 text-4xl font-bold">{activeJobs.length}</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">Completed</p>
            <p className="mt-2 text-4xl font-bold">{completedJobs.length}</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-500">Total Earnings</p>
            <p className="mt-2 text-4xl font-bold">$0</p>
          </div>
        </div>

        <div className="mb-8 flex rounded-2xl border bg-white p-1">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 rounded-xl px-4 py-3 font-medium ${activeTab === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-50"
              }`}
          >
            Active ({activeJobs.length})
          </button>

          <button
            onClick={() => setActiveTab("APPLIED")}
            className={`flex-1 rounded-xl px-4 py-3 font-medium ${activeTab === "APPLIED"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-50"
              }`}
          >
            Applied ({appliedJobs.length})
          </button>

          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex-1 rounded-xl px-4 py-3 font-medium ${activeTab === "COMPLETED"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-50"
              }`}
          >
            Completed ({completedJobs.length})
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-6">Loading jobs...</div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">No jobs in this section</h3>
            <p className="mt-2 text-slate-600">
              Try applying to some jobs from Find Jobs.
            </p>
            <button
              onClick={() => navigate("/worker/jobs")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Find Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {visibleJobs.map((item) => (
              <div
                key={item.application_id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {item.job_title}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[item.application_status] ||
                      "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {item.application_status}
                  </span>
                </div>

                <p className="mb-5 text-slate-600">
                  {item.job_description.length > 140
                    ? `${item.job_description.slice(0, 140)}...`
                    : item.job_description}
                </p>

                <div className="mb-5 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>
                      {item.area}, {item.city}, {item.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>
                      {item.budget_min} - {item.budget_max}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>⏱</span>
                    <span>Applied {formatTimeAgo(item.applied_at)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() =>
                        navigate(
                          item.application_status === "SELECTED"
                            ? `/worker/active-jobs/${item.job_id}`
                            : `/worker/jobs/${item.job_id}`
                        )
                      }
                      className="rounded-xl border px-4 py-2 font-medium hover:bg-slate-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}