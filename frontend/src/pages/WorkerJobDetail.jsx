import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicJob } from "../api/jobs";
import { getMyApplications } from "../api/applications";
import ApplyJobModal from "../components/ApplyJobModal";


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

export default function WorkerJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    loadJob();
    loadMyApplications();
  }, [jobId]);

  async function loadJob() {
    try {
      setLoading(true);
      setError("");
      const data = await getPublicJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Job not found");
    } finally {
      setLoading(false);
    }
  }

  async function loadMyApplications() {
    try {
      const data = await getMyApplications();
      setMyApplications(data);
    } catch (err) {
      console.error(err);
    }
  }

  const alreadyApplied = myApplications.some((app) => app.job_id === jobId);

  async function handleApplySuccess() {
    setShowApplyModal(false);
    setSuccessMessage("Successfully applied to this job.");
    await loadMyApplications();
  }

  if (loading) return <div className="p-6">Loading job...</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!job) return <div className="p-6">Job not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/worker/jobs")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Find Jobs
        </button>

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {successMessage}
          </div>
        )}

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-3 text-3xl font-bold leading-tight text-slate-900">
                {job.title}
              </h1>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {job.status}
              </span>
            </div>

            {alreadyApplied ? (
              <button
                disabled
                className="rounded-xl bg-green-100 px-5 py-3 font-medium text-green-700"
              >
                ✓ Applied
              </button>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
              >
                Apply Now
              </button>
            )}
          </div>

          <div className="mb-8 rounded-2xl border p-6">
            <p className="mb-2 text-sm text-slate-500">Posted By</p>

            <div className="flex items-center gap-4">
              {job.poster_photo_data_url ? (
                <img
                  src={job.poster_photo_data_url}
                  alt={job.poster_name}
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-slate-100 text-lg font-semibold text-slate-600">
                  {job.poster_name?.[0]?.toUpperCase() || "C"}
                </div>
              )}

              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {job.poster_name || "Client"}
                </p>
                <p className="mt-2 text-slate-600">
                  Poster details and ratings will be enhanced later.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-6 border-b pb-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-slate-500">Budget</p>
              <p className="text-lg font-semibold text-slate-900">
                ${job.budget_min}-{job.budget_max}
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
              <p className="mb-1 text-sm text-slate-500">Duration</p>
              <p className="text-lg font-semibold text-slate-900">
                {job.estimated_duration_value} {job.estimated_duration_unit}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              Job Description
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
        </div>
      </div>

      {job && !alreadyApplied && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={job}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}