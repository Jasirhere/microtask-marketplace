import { useState } from "react";
import Modal from "./Modal";

export default function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmit,
  targetName = "the other party",
  loading = false,
  reviewSubmitted = false,
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!rating) {
      alert("Please select a rating before submitting your review.");
      return;
    }

    onSubmit({
      rating,
      feedback: feedback.trim(),
    });
  }

  function handleClose() {
    setRating(0);
    setFeedback("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Leave a Review">
      {reviewSubmitted ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
              ✓
            </div>

            <h3 className="mt-4 break-words text-lg font-bold text-slate-900">
              Review submitted
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-slate-700">
              Your review has been saved.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-500">
              You are reviewing
            </p>

            <h3 className="mt-1 break-words text-base font-bold text-slate-900 sm:text-lg">
              {targetName}
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Rating *
            </label>

            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border text-2xl transition ${
                    rating >= star
                      ? "border-yellow-400 bg-yellow-50 text-yellow-500"
                      : "border-slate-200 bg-white text-slate-300 hover:bg-slate-50"
                  }`}
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Select 1 to 5 stars.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Feedback
            </label>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              placeholder="Write a short review..."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}