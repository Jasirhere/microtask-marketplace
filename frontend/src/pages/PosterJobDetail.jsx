import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getJobById, deleteJob } from "../api/jobs";
import { submitReview } from "../api/reviews";

import JobStatusBadge from "../components/JobStatusBadge";
import Modal from "../components/Modal";
import CreateJobForm from "../components/CreateJobForm";
import ApplicantsModal from "../components/ApplicantsModal";

function formatTimeAgo(dateString) {
  if (!dateString) return "Not set";

  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatLocation(job) {
  return [job.area, job.city, job.state, job.country].filter(Boolean).join(", ");
}

function budgetLabel(job) {
  if (job.budget_min && job.budget_max) {
    return `$${job.budget_min}-${job.budget_max}`;
  }

  if (job.budget_max) return `$${job.budget_max}`;
  if (job.budget_min) return `$${job.budget_min}`;

  return "Not set";
}

function deadlineLabel(job) {
  if (!job.deadline_value || !job.deadline_unit) return "Not set";
  return `${job.deadline_value} ${job.deadline_unit}`;
}

function durationLabel(job) {
  if (!job.estimated_duration_value || !job.estimated_duration_unit) {
    return "Not set";
  }

  return `${job.estimated_duration_value} ${job.estimated_duration_unit}`;
}

function hasAssignedWorker(job) {
  return Boolean(
    job.selected_worker_user_id ||
      job.selected_worker_name ||
      job.status === "ASSIGNED" ||
      job.status === "IN_PROGRESS" ||
      job.status === "COMPLETED"
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

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
    const confirmed = window.confirm("Do you want to close/delete this job?");
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

  async function handleSubmitReview() {
    if (!job?.selected_worker_user_id) {
      alert("No selected worker found for this job.");
      return;
    }

    try {
      await submitReview({
        job_id: job.id,
        reviewee_user_id: job.selected_worker_user_id,
        rating,
        comment,
      });

      setReviewSubmitted(true);
    } catch (err) {
      console.error("Review failed", err);
      alert(err?.response?.data?.detail || "Failed to submit review");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          Job not found.
        </div>
      </div>
    );
  }

  const workerAssigned = hasAssignedWorker(job);
  const jobCompleted = job.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/poster"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold leading-tight text-slate-950">
                {job.title}
              </h1>

              <div className="mt-3">
                <JobStatusBadge status={job.status} />
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                ✎ Edit
              </button>

              <button
                onClick={handleDeleteJob}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                ⊙ Close Job
              </button>
            </div>
          </div>

          {workerAssigned && (
            <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span>♙</span>
                <span>Worker Assigned</span>
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  {job.selected_worker_photo_data_url ? (
                    <img
                      src={job.selected_worker_photo_data_url}
                      alt={job.selected_worker_name || "Assigned worker"}
                      className="h-16 w-16 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-slate-100 text-xl font-semibold text-slate-600">
                      {job.selected_worker_name?.[0]?.toUpperCase() || "W"}
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {job.selected_worker_name || "Assigned Worker"}
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      {job.selected_worker_bio ||
                        "Worker selected for this job."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                      {job.selected_worker_rating && (
                        <span>⭐ {job.selected_worker_rating} rating</span>
                      )}

                      {job.selected_worker_completed_jobs_count && (
                        <span>
                          {job.selected_worker_completed_jobs_count} jobs
                          completed
                        </span>
                      )}

                      {job.selected_worker_joined_text && (
                        <span>Joined {job.selected_worker_joined_text}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/chat?jobId=${job.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Message Worker
                  </button>

                  {!jobCompleted && (
                    <button
                      onClick={() =>
                        alert(
                          "Mark as completed is already handled in your completion flow. We can wire this button to that endpoint next."
                        )
                      }
                      className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!workerAssigned && (
            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">
                No worker assigned yet
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Review applicants and select a worker before the job can start.
              </p>

              <button
                onClick={() => setShowApplicantsModal(true)}
                className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                View Applicants
              </button>
            </div>
          )}

          <div className="mt-8 grid gap-x-12 gap-y-7 border-b border-slate-200 pb-8 sm:grid-cols-2">
            <InfoItem icon="💲" label="Budget" value={budgetLabel(job)} />
            <InfoItem
              icon="📍"
              label="Location"
              value={formatLocation(job) || "Not set"}
            />
            <InfoItem icon="🏷️" label="Category" value={job.category || "Not set"} />
            <InfoItem icon="🕘" label="Posted" value={formatTimeAgo(job.created_at)} />
            <InfoItem icon="📅" label="Deadline" value={deadlineLabel(job)} />
            <InfoItem icon="🧳" label="Duration" value={durationLabel(job)} />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-950">Description</h2>
            <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700">
              {job.description || "No description provided."}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-950">Skills Required</h2>

            {Array.isArray(job.skills_required) &&
            job.skills_required.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills_required.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No specific skills listed.
              </p>
            )}
          </section>

          {job.notes && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-slate-950">Notes</h2>
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                {job.notes}
              </p>
            </section>
          )}

          {jobCompleted && !reviewSubmitted && workerAssigned && (
            <section className="mt-8 rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">
                Leave a Review for the Worker
              </h3>

              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      rating >= star ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
                rows={3}
                className="mt-4 w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Review
              </button>
            </section>
          )}

          {reviewSubmitted && (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700">
              Review submitted. Thank you.
            </div>
          )}
        </div>
      </div>

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

      <ApplicantsModal
        isOpen={showApplicantsModal}
        onClose={() => setShowApplicantsModal(false)}
        job={job}
      />
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-400">{icon}</div>

      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}