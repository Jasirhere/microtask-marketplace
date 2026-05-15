import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicJob } from "../api/jobs";
import { getMyApplications } from "../api/applications";
import { submitReview } from "../api/reviews";
import ApplyJobModal from "../components/ApplyJobModal";

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";

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

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

function formatLocation(job) {
  return [job.area, job.city, job.state, job.country].filter(Boolean).join(", ");
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

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  const alreadyApplied = myApplications.some(
    (app) => String(app.job_id) === String(jobId)
  );

  async function handleApplySuccess() {
    setShowApplyModal(false);
    setSuccessMessage("Successfully applied to this job.");
    await loadMyApplications();
  }

  async function handleSubmitReview() {
    try {
      await submitReview({
        job_id: job.id,
        reviewee_user_id: job.poster_user_id,
        rating,
        feedback: comment,
      });

      setReviewSubmitted(true);
    } catch (err) {
      console.error("Review failed", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading job...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate("/worker/jobs")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            type="button"
          >
            ← Back to Find Jobs
          </button>

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
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Job not found.
        </div>
      </div>
    );
  }

  const jobCompleted = job.status === "COMPLETED";
  const skills = Array.isArray(job.skills_required) ? job.skills_required : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <button
          onClick={() => navigate("/worker/jobs")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          type="button"
        >
          ← Back to Find Jobs
        </button>

        {successMessage && (
          <div className="mb-5 break-words rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <div className="border-b border-slate-200 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                  {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {job.status}
                  </span>

                  {job.category && (
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {job.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {alreadyApplied ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-green-100 px-5 py-3 text-sm font-semibold text-green-700 md:w-auto"
                    type="button"
                  >
                    ✓ Applied
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 md:w-auto"
                    type="button"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            <section className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="mb-3 text-sm font-medium text-slate-500">
                Posted By
              </p>

              <div className="flex min-w-0 items-center gap-4">
                {job.poster_photo_data_url ? (
                  <img
                    src={job.poster_photo_data_url}
                    alt={job.poster_name || "Client"}
                    className="h-14 w-14 shrink-0 rounded-full border object-cover sm:h-16 sm:w-16"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-slate-100 text-lg font-semibold text-slate-600 sm:h-16 sm:w-16">
                    {job.poster_name?.[0]?.toUpperCase() || "C"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="break-words text-lg font-semibold text-slate-900 sm:text-2xl">
                    {job.poster_name || "Client"}
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-600">
                    Poster details and ratings will be enhanced later.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-7 grid gap-4 border-b border-slate-200 pb-7 sm:grid-cols-2 lg:grid-cols-3">
              <InfoBlock
                label="Budget"
                value={`${money(job.budget_min)} - ${money(job.budget_max)}`}
              />

              <InfoBlock
                label="Location"
                value={formatLocation(job) || "Location not set"}
                helper={job.address_details}
              />

              <InfoBlock label="Category" value={job.category || "General"} />

              <InfoBlock label="Posted" value={formatTimeAgo(job.created_at)} />

              <InfoBlock
                label="Deadline"
                value={
                  job.deadline_value && job.deadline_unit
                    ? `${job.deadline_value} ${job.deadline_unit}`
                    : "Not set"
                }
              />

              <InfoBlock
                label="Duration"
                value={
                  job.estimated_duration_value && job.estimated_duration_unit
                    ? `${job.estimated_duration_value} ${job.estimated_duration_unit}`
                    : "Not set"
                }
              />
            </section>

            <section className="mb-7">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:text-xl">
                Job Description
              </h2>

              <p className="break-words text-sm leading-7 text-slate-700 sm:text-base">
                {job.description}
              </p>
            </section>

            <section className="mb-7">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:text-xl">
                Skills Required
              </h2>

              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No specific skills listed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="max-w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700"
                    >
                      <span className="break-words">{skill}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {jobCompleted && !reviewSubmitted && (
              <section className="mt-6 rounded-xl border border-slate-200 p-4 sm:p-5">
                <h3 className="mb-3 break-words font-semibold text-slate-900">
                  Leave a Review for the Client
                </h3>

                <div className="mb-3 flex flex-wrap gap-2">
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
                  rows={4}
                  className="mb-3 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={rating === 0}
                  className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 sm:w-auto"
                >
                  Submit Review
                </button>
              </section>
            )}

            {reviewSubmitted && (
              <div className="mt-6 break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                Review submitted. Thank you.
              </div>
            )}
          </div>
        </article>
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

function InfoBlock({ label, value, helper }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-4">
      <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>

      <p className="break-words text-base font-semibold text-slate-900 sm:text-lg">
        {value}
      </p>

      {helper && (
        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
          {helper}
        </p>
      )}
    </div>
  );
}