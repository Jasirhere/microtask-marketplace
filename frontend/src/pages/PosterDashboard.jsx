import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getMyJobs } from "../api/jobs";
import DashboardHeader from "../components/DashboardHeader";
import Modal from "../components/Modal";
import CreateJobForm from "../components/CreateJobForm";
import JobStatusBadge from "../components/JobStatusBadge";

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

export default function PosterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (!user.poster_profile) {
      navigate("/setup/poster");
      return;
    }

    loadJobs();
  }, [user, navigate]);

  async function loadJobs() {
    try {
      setJobsError("");
      setLoadingJobs(true);
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      setJobsError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }

  function handleCreateSuccess() {
    setShowCreateModal(false);
    loadJobs();
  }

  if (!user?.poster_profile) {
    return <div className="p-6">Loading poster dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Poster Dashboard</h1>
            <p className="mt-2 text-lg text-slate-600">
              Manage your posted jobs and find workers
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            + Create New Job
          </button>
        </div>

        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Poster Profile</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium">{user.poster_profile.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium">{user.poster_profile.phone}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-medium">
                {user.poster_profile.location || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Current Mode</p>
              <p className="font-medium">{user.current_mode}</p>
            </div>

            {user.poster_profile.bio && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Bio</p>
                <p className="font-medium">{user.poster_profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {loadingJobs ? (
          <div className="rounded-2xl border bg-white p-6">Loading jobs...</div>
        ) : jobsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {jobsError}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">No jobs posted yet</h3>
            <p className="mt-2 text-slate-600">
              Start by creating your first job posting.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold leading-snug text-slate-900">
                    {job.title}
                  </h3>
                  <JobStatusBadge status={job.status} />
                </div>

                <p className="mb-5 text-slate-600">
                  {job.description.length > 140
                    ? `${job.description.slice(0, 140)}...`
                    : job.description}
                </p>

                <div className="mb-5 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>
                      {job.area && job.city && job.country
                        ? `${job.area}, ${job.city}, ${job.country}`
                        : "Location not set"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>
                      {job.budget_min} - {job.budget_max}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>⏱</span>
                    <span>{formatTimeAgo(job.created_at)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => navigate(`/poster/jobs/${job.id}`)}
                      className="rounded-xl border px-4 py-2 font-medium hover:bg-slate-50"
                    >
                      View
                    </button>

                    <button className="rounded-xl border px-4 py-2 font-medium hover:bg-slate-50">
                      Edit
                    </button>

                    <button className="rounded-xl border px-4 py-2 font-medium text-red-600 hover:bg-red-50">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
      >
        <CreateJobForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}