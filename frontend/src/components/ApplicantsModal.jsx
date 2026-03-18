import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
} from "../api/applications";

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
      setApplicants(data);
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
        <div>Loading applicants...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-slate-500">No applicants yet.</div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div
              key={applicant.application_id}
              className="rounded-2xl border p-4"
            >
              <div className="mb-3 flex items-center gap-4">
                {applicant.worker_photo_data_url ? (
                  <img
                    src={applicant.worker_photo_data_url}
                    alt={applicant.worker_name}
                    className="h-14 w-14 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-slate-100 font-semibold text-slate-600">
                    {applicant.worker_name?.[0]?.toUpperCase() || "W"}
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {applicant.worker_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Applied {formatTimeAgo(applicant.applied_at)}
                  </p>
                </div>
              </div>

              <div className="mb-3 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Proposed Rate:</span> ${applicant.proposed_rate}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Status:</span> {applicant.status}
                </p>
              </div>

              {applicant.cover_letter && (
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-slate-800">
                    Cover Letter
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {applicant.cover_letter}
                  </p>
                </div>
              )}

              {applicant.status === "APPLIED" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(applicant.application_id)}
                    disabled={actionLoadingId === applicant.application_id}
                    className="rounded-xl border px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleAccept(applicant.application_id)}
                    disabled={actionLoadingId === applicant.application_id}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}