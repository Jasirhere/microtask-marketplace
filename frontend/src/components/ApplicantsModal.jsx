import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applications";

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

export default function ApplicantsModal({ isOpen, onClose, job }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (isOpen && job?.id) {
      loadApplicants();
    }
  }, [isOpen, job?.id]);

  async function loadApplicants() {
    try {
      setLoading(true);
      setError("");

      const data = await getApplicationsForJob(job.id);
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(applicationId) {
    try {
      setActionLoadingId(applicationId);
      await acceptApplication(applicationId);
      await loadApplicants();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to accept applicant");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(applicationId) {
    try {
      setActionLoadingId(applicationId);
      await rejectApplication(applicationId);
      await loadApplicants();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to reject applicant");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Applicants${job?.title ? ` — ${job.title}` : ""}`}
    >
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Loading applicants...
        </div>
      ) : error ? (
        <div className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600">
          No applicants yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.application_id}
              applicant={applicant}
              actionLoadingId={actionLoadingId}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

function ApplicantCard({
  applicant,
  actionLoadingId,
  onAccept,
  onReject,
}) {
  const isActionLoading = actionLoadingId === applicant.application_id;

  return (
    <article className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {applicant.worker_photo_data_url ? (
          <img
            src={applicant.worker_photo_data_url}
            alt={applicant.worker_name || "Worker"}
            className="h-14 w-14 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-slate-100 font-semibold text-slate-600">
            {applicant.worker_name?.[0]?.toUpperCase() || "W"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-lg font-semibold text-slate-900">
                {applicant.worker_name || "Worker"}
              </p>

              {(applicant.worker_reviews_count ?? 0) > 0 ? (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="shrink-0 text-yellow-500">⭐</span>

                  <span className="break-words">
                    <span className="font-semibold text-slate-900">
                      {applicant.worker_average_rating ?? 0}
                    </span>{" "}
                    ({applicant.worker_reviews_count ?? 0} reviews)
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-slate-500">
                  No reviews yet
                </div>
              )}

              <p className="mt-2 break-words text-sm text-slate-500">
                Applied {formatTimeAgo(applicant.applied_at)}
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {applicant.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Proposed Rate
              </p>

              <p className="mt-1 break-words font-semibold text-slate-900">
                {money(applicant.proposed_rate)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Application Status
              </p>

              <p className="mt-1 break-words font-semibold text-slate-900">
                {applicant.status}
              </p>
            </div>
          </div>

          {applicant.cover_letter && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-semibold text-slate-800">
                Cover Letter
              </p>

              <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                {applicant.cover_letter}
              </p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <button
              onClick={() =>
                window.open(`/workers/${applicant.worker_user_id}`, "_blank")
              }
              className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-600 hover:bg-violet-50"
              type="button"
            >
              View Worker Profile
            </button>

            {applicant.status === "APPLIED" && (
              <>
                <button
                  onClick={() => onReject(applicant.application_id)}
                  disabled={isActionLoading}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  type="button"
                >
                  {isActionLoading ? "Working..." : "Reject"}
                </button>

                <button
                  onClick={() => onAccept(applicant.application_id)}
                  disabled={isActionLoading}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  type="button"
                >
                  {isActionLoading ? "Working..." : "Accept"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}