import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById, deleteJob } from "../api/jobs";
import JobStatusBadge from "../components/JobStatusBadge";
import Modal from "../components/Modal";
import CreateJobForm from "../components/CreateJobForm";
import ApplicantsModal from "../components/ApplicantsModal";

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

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function PosterJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);

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

  async function handleDeleteJob() {
    const confirmed = window.confirm("Do you want to delete this gig posted?");
    if (!confirmed) return;

    try {
      await deleteJob(jobId);
      navigate("/poster");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete job");
    }
  }

  async function handleEditSuccess() {
    setShowEditModal(false);
    await loadJob();
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

  const showAssignedWorker =
    job.status === "ASSIGNED" && job.selected_worker_name;

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
              <button
                onClick={() => setShowEditModal(true)}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Edit
              </button>

              <button
                onClick={handleDeleteJob}
                className="rounded-xl border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Close Job
              </button>
            </div>
          </div>

          {showAssignedWorker && (
            <div className="mb-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <span>👤</span>
                <span>Worker Assigned</span>
              </div>

              <div className="flex items-start gap-4">
                {job.selected_worker_photo_data_url ? (
                  <img
                    src={job.selected_worker_photo_data_url}
                    alt={job.selected_worker_name}
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-slate-100 text-xl font-semibold text-slate-600">
                    {job.selected_worker_name?.[0]?.toUpperCase() || "W"}
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {job.selected_worker_name}
                  </h2>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    {job.selected_worker_bio ||
                      "Experienced worker assigned to this project."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span>
                        <span className="font-semibold">
                          {job.selected_worker_rating ?? 4.8}
                        </span>{" "}
                        ({job.selected_worker_reviews_count ?? 127} reviews)
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold">
                        {job.selected_worker_completed_jobs_count ?? 156}
                      </span>{" "}
                      jobs completed
                    </div>

                    <div>
                      Joined {job.selected_worker_joined_text || "January 2023"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 grid gap-8 border-b pb-8 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Budget"
              value={`$${job.budget_min}-${job.budget_max}`}
            />
            <InfoItem
              label="Location"
              value={`${job.city}, ${job.country}`}
            />
            <InfoItem label="Category" value={job.category} />
            <InfoItem label="Posted" value={formatTimeAgo(job.created_at)} />
            <InfoItem
              label="Deadline"
              value={`${job.deadline_value} ${job.deadline_unit}`}
            />
            <InfoItem
              label="Duration"
              value={`${job.estimated_duration_value} ${job.estimated_duration_unit}`}
            />
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Description
            </h2>
            <p className="text-base leading-8 text-slate-700">
              {job.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
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
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                Notes
              </h2>
              <p className="text-base leading-8 text-slate-700">
                {job.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {job && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Job"
        >
          <CreateJobForm
            mode="edit"
            initialValues={job}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {job && (
        <ApplicantsModal
          isOpen={showApplicantsModal}
          onClose={() => setShowApplicantsModal(false)}
          job={job}
        />
      )}
    </div>
  );
}