import { useEffect, useState } from "react";
import { getCompletionStatus, markJobCompleted } from "../api/completion";
import { submitReview } from "../api/reviews";
import CompleteJobConfirmModal from "./CompleteJobConfirmModal";
import LeaveReviewModal from "./LeaveReviewModal";

export default function AssignedJobCompletionActions({
  jobId,
  openChat,
  revieweeUserId,
  revieweeName,
  currentSide,
}) {
  const [completion, setCompletion] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    loadCompletion();
  }, [jobId]);

  async function loadCompletion() {
    try {
      const data = await getCompletionStatus(jobId);
      setCompletion(data);
    } catch (err) {
      console.error(err);
    }
  }

  function alreadyCompletedByMe() {
    if (!completion) return false;
    return currentSide === "poster"
      ? completion.poster_confirmed
      : completion.worker_confirmed;
  }
  async function handleConfirmComplete() {
    try {
      setLoadingComplete(true);
      const data = await markJobCompleted(jobId);
      setCompletion(data);
      setShowConfirm(false);

      // Show review modal if current user's side is confirmed
      const userConfirmed = currentSide === "poster" ? data?.poster_confirmed : data?.worker_confirmed;
      if (userConfirmed) {
        setShowReview(true);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to mark job as completed");
    } finally {
      setLoadingComplete(false);
    }
  }

  async function handleSubmitReview({ rating, feedback }) {
    try {
      setLoadingReview(true);
      await submitReview({
        job_id: jobId,
        reviewee_user_id: revieweeUserId,
        reviewee_role: currentSide === "poster" ? "worker" : "poster",
        rating,
        comment: feedback,
      });

      setReviewSubmitted(true);
    } catch (err) {
      console.error("Review submit failed", err);
      alert(err?.response?.data?.detail || "Failed to submit review");
    } finally {
      setLoadingReview(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {!alreadyCompletedByMe() && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-lg font-semibold text-white hover:bg-green-700"
          >
            <span>✓</span>
            <span>Mark as Completed</span>
          </button>
        )}

        {alreadyCompletedByMe() && (
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            You marked this job as completed
          </div>
        )}

        <button
          onClick={openChat}
          className="rounded-xl border px-5 py-3 text-lg font-medium text-slate-800 hover:bg-slate-50"
        >
          Open Chat
        </button>
      </div>

      <CompleteJobConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmComplete}
        loading={loadingComplete}
      />

      <LeaveReviewModal
        isOpen={showReview}
        onClose={() => {
          setShowReview(false);
          setReviewSubmitted(false);
        }}
        onSubmit={handleSubmitReview}
        targetName={revieweeName}
        loading={loadingReview}
        reviewSubmitted={reviewSubmitted}
      />
    </>
  );
}