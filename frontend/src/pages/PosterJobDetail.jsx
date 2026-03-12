import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../api/jobs";
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

export default function PosterJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    try {
      setLoading(true);
      setError("");
      const data = await getJobById(jobId);
      setJob(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load job");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading job details...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return <div className="p-6">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/poster"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-3 text-3xl font-bold leading-tight text-slate-900">
                {job.title}
              </h1>
              <JobStatusBadge status={job.status} />
            </div>

            <div className="flex gap-3">
              <button className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Edit
              </button>
              <button className="rounded-xl border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                Close Job
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 border-b pb-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-slate-500">Budget</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.budget_min} - {job.budget_max}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-500">Location</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.area}, {job.city}, {job.country}
              </p>
              {job.address_details && (
                <p className="mt-1 text-sm text-slate-600">
                  {job.address_details}
                </p>
              )}
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-500">Category</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.category}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-500">Posted</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatTimeAgo(job.created_at)}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-500">Deadline</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.deadline_value} {job.deadline_unit}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-500">Estimated Duration</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.estimated_duration_value} {job.estimated_duration_unit}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              Description
            </h2>
            <p className="text-base leading-7 text-slate-700">
              {job.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              Skills Required
            </h2>

            {job.skills_required.length === 0 ? (
              <p className="text-sm text-slate-500">No specific skills listed</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {job.skills_required.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {job.notes && (
            <div>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                Notes
              </h2>
              <p className="text-base leading-7 text-slate-700">
                {job.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}