import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  DollarSign,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";

import { getMyWorkerJobs } from "../api/applications";
import DashboardHeader from "../components/DashboardHeader";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
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
    () =>
      jobs.filter(
        (item) =>
          item.application_status === "SELECTED" &&
          item.job_status !== "COMPLETED"
      ),
    [jobs]
  );

  const completedJobs = useMemo(
    () =>
      jobs.filter(
        (item) =>
          item.job_status === "COMPLETED" ||
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

  const successRate =
    jobs.length === 0 ? 0 : Math.round((completedJobs.length / jobs.length) * 100);

  const totalEarnings = jobs
    .filter(
      (item) =>
        item.job_status === "COMPLETED" && item.payment_status === "PAID"
    )
    .reduce(
      (sum, item) => sum + Number(item.final_price || item.proposed_rate || item.budget_max || item.budget_min || 0),
      0
    );

  return (
    <div className="min-h-screen bg-[#f7f2ff]">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 px-8 py-7 text-white shadow-sm">
          <h1 className="text-2xl font-bold">Welcome back, Worker!</h1>
          <p className="mt-2 text-sm font-medium text-white/90">
            Ready to find your next opportunity?
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <StatCard
            title="Active Applications"
            value={appliedJobs.length}
            icon={<Briefcase />}
          />
          <StatCard
            title="Jobs Completed"
            value={completedJobs.length}
            icon={<Star />}
          />
          <StatCard
            title="Total Earnings"
            value={money(totalEarnings)}
            icon={<DollarSign />}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={<TrendingUp />}
          />
        </section>

        <section className="mt-6 rounded-2xl bg-white p-7 shadow">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <QuickAction
              icon={<Search />}
              title="Browse Jobs"
              subtitle="Find opportunities"
              onClick={() => navigate("/worker/jobs")}
            />

            <QuickAction
              icon={<Briefcase />}
              title="My Applications"
              subtitle="Track progress"
              onClick={() => setActiveTab("APPLIED")}
            />

            <QuickAction
              icon={<Clock />}
              title="Active Jobs"
              subtitle="Manage work"
              onClick={() => setActiveTab("ACTIVE")}
            />
          </div>
        </section>

        <section className="mt-7 rounded-2xl bg-white p-7 shadow">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === "ACTIVE"
                ? "My Active Jobs"
                : activeTab === "APPLIED"
                  ? "My Applications"
                  : "My Completed Jobs"}
            </h2>
          </div>

          <div className="mb-6 grid grid-cols-3 rounded-xl border bg-white p-1">
            <TabButton
              active={activeTab === "ACTIVE"}
              onClick={() => setActiveTab("ACTIVE")}
              label={`Active (${activeJobs.length})`}
            />
            <TabButton
              active={activeTab === "APPLIED"}
              onClick={() => setActiveTab("APPLIED")}
              label={`Applied (${appliedJobs.length})`}
            />
            <TabButton
              active={activeTab === "COMPLETED"}
              onClick={() => setActiveTab("COMPLETED")}
              label={`Completed (${completedJobs.length})`}
            />
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border p-6">Loading jobs...</div>
          ) : visibleJobs.length === 0 ? (
            <div className="rounded-xl border p-10 text-center">
              <h3 className="text-lg font-semibold">No jobs in this section</h3>
              <p className="mt-2 text-slate-600">
                Try applying to some jobs from Browse Jobs.
              </p>

              <button
                onClick={() => navigate("/worker/jobs")}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((item) =>
                activeTab === "COMPLETED" ? (
                  <CompletedJobCard
                    key={item.application_id}
                    item={item}
                    navigate={navigate}
                  />
                ) : (
                  <WorkerJobCard
                    key={item.application_id}
                    item={item}
                    navigate={navigate}
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
        </div>

        <div className="text-purple-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50"
    >
      <div className="text-purple-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>

      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function WorkerJobCard({ item, navigate }) {
  return (
    <div
      className="rounded-xl border border-slate-200 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {item.job_title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {item.job_description?.length > 90
              ? `${item.job_description.slice(0, 90)}...`
              : item.job_description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.job_status === "COMPLETED" && item.payment_status === "PAID"
              ? "bg-green-100 text-green-700"
              : item.job_status === "COMPLETED"
                ? "bg-blue-100 text-blue-700"
                : STATUS_STYLES[item.application_status] ||
                  "bg-slate-100 text-slate-700"
          }`}
        >
          {item.job_status === "COMPLETED" && item.payment_status === "PAID"
            ? "Payment Received"
            : item.job_status === "COMPLETED"
              ? "Awaiting Payment"
              : item.application_status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-slate-200 pb-4 text-sm text-slate-600">
        <span>{money(item.final_price || item.proposed_rate || item.budget_max || item.budget_min)}</span>
        <span>
          {item.job_status === "COMPLETED"
            ? `Completed ${formatDate(item.applied_at)}`
            : `Applied ${formatDate(item.applied_at)}`}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            AC
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Client
            </p>
            <p className="text-xs text-slate-500">
              {item.area}, {item.city}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(
              item.application_status === "SELECTED"
                ? `/worker/active-jobs/${item.job_id}`
                : `/worker/jobs/${item.job_id}`
            )
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function CompletedJobCard({ item, navigate }) {
  const earnedAmount = Number(
    item.final_price ||
    item.proposed_rate ||
    item.budget_max ||
    item.budget_min ||
    0
  );

  const posterInitial = (item.poster_name || "C")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-950">
            {item.job_title}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Completed{" "}
            {new Date(item.paid_at || item.created_at).toLocaleDateString()}
          </p>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
          COMPLETED
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">
        {item.job_description}
      </p>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Earned
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              ${earnedAmount}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Client Rating
            </p>

            <div className="mt-1 flex items-center justify-end gap-1 text-xl font-bold text-slate-900">
              <span className="text-yellow-500">★</span>
              <span>{item.client_rating || 5}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.poster_photo_data_url ? (
              <img
                src={item.poster_photo_data_url}
                alt={item.poster_name || "Client"}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {posterInitial}
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-900">
                {item.poster_name || "Client"}
              </p>

              <p className="text-sm text-slate-500">
                {item.city}, {item.country}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/worker/active-jobs/${item.job_id}`)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}