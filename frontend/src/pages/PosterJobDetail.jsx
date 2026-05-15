import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getJobById, deleteJob } from "../api/jobs";
import { submitReview } from "../api/reviews";

import JobStatusBadge from "../components/JobStatusBadge";
import Modal from "../components/Modal";
import CreateJobForm from "../components/CreateJobForm";
import ApplicantsModal from "../components/ApplicantsModal";
import AssignedJobCompletionActions from "../components/AssignedJobCompletionActions";

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
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/poster"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Job not found.
        </div>
      </div>
    );
  }

  const workerAssigned = hasAssignedWorker(job);
  const jobCompleted = job.status === "COMPLETED";
  const skills = Array.isArray(job.skills_required) ? job.skills_required : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/poster"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <header className="border-b border-slate-200 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                  {job.title}
                </h1>

                <div className="mt-3">
                  <JobStatusBadge status={job.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:shrink-0 lg:flex-wrap lg:justify-end">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  type="button"
                >
                  ✎ Edit
                </button>

                <button
                  onClick={handleDeleteJob}
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  type="button"
                >
                  ⊙ Close Job
                </button>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-7 lg:p-8">
            {workerAssigned && (
              <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
                <div className="mb-4 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="shrink-0">♙</span>
                  <span className="break-words">Worker Assigned</span>
                </div>

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                    {job.selected_worker_photo_data_url ? (
                      <img
                        src={job.selected_worker_photo_data_url}
                        alt={job.selected_worker_name || "Assigned worker"}
                        className="h-14 w-14 shrink-0 rounded-full border object-cover sm:h-16 sm:w-16"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-slate-100 text-xl font-semibold text-slate-600 sm:h-16 sm:w-16">
                        {job.selected_worker_name?.[0]?.toUpperCase() || "W"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold text-slate-950">
                        {job.selected_worker_name || "Assigned Worker"}
                      </h2>

                      <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-slate-600">
                        {job.selected_worker_bio ||
                          "Worker selected for this job."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
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

                  <div className="w-full shrink-0 xl:w-auto">
                    {!jobCompleted ? (
                      <AssignedJobCompletionActions
                        jobId={job.id}
                        currentSide="poster"
                        revieweeUserId={job.selected_worker_user_id}
                        revieweeName={job.selected_worker_name || "Worker"}
                        openChat={() => navigate(`/chat?jobId=${job.id}`)}
                      />
                    ) : (
                      <button
                        onClick={() => navigate(`/chat?jobId=${job.id}`)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
                        type="button"
                      >
                        Message Worker
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

            {!workerAssigned && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                <p className="break-words text-sm font-semibold text-amber-900">
                  No worker assigned yet
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-amber-700">
                  Review applicants and select a worker before the job can start.
                </p>

                <button
                  onClick={() => setShowApplicantsModal(true)}
                  className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 sm:w-auto"
                  type="button"
                >
                  View Applicants
                </button>
              </section>
            )}

            <section className="mt-7 grid gap-4 border-b border-slate-200 pb-7 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem icon="💲" label="Budget" value={budgetLabel(job)} />

              <InfoItem
                icon="📍"
                label="Location"
                value={formatLocation(job) || "Not set"}
              />

              <InfoItem
                icon="🏷️"
                label="Category"
                value={job.category || "Not set"}
              />

              <InfoItem
                icon="🕘"
                label="Posted"
                value={formatTimeAgo(job.created_at)}
              />

              <InfoItem icon="📅" label="Deadline" value={deadlineLabel(job)} />

              <InfoItem icon="🧳" label="Duration" value={durationLabel(job)} />
            </section>

            <section className="mt-7">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700 sm:text-base">
                {job.description || "No description provided."}
              </p>
            </section>

            <section className="mt-7">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Skills Required
              </h2>

              {skills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="max-w-full rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                    >
                      <span className="break-words">{skill}</span>
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
              <section className="mt-7">
                <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                  Notes
                </h2>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700 sm:text-base">
                  {job.notes}
                </p>
              </section>
            )}

            {jobCompleted && !reviewSubmitted && workerAssigned && (
              <section className="mt-7 rounded-2xl border border-slate-200 p-4 sm:p-5">
                <h3 className="break-words font-semibold text-slate-900">
                  Leave a Review for the Worker
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-2xl transition-colors ${
                        rating >= star
                          ? "border-yellow-400 bg-yellow-50 text-yellow-500"
                          : "border-slate-200 bg-white text-gray-300 hover:bg-slate-50"
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
                  rows={4}
                  className="mt-4 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={rating === 0}
                  className="mt-4 w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Submit Review
                </button>
              </section>
            )}

            {reviewSubmitted && (
              <div className="mt-7 break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                Review submitted. Thank you.
              </div>
            )}
          </div>
        </article>
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
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4">
      <div className="mt-1 shrink-0 text-slate-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-900">
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}