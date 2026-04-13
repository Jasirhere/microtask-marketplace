import { useEffect, useState } from "react";

const LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmit,
  targetName,
  loading = false,
  reviewSubmitted = false,
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!isOpen && !reviewSubmitted) {
      setRating(0);
      setFeedback("");
    }
  }, [isOpen, reviewSubmitted]);

  if (!isOpen) return null;

  function handleSubmit() {
    if (!rating || !feedback.trim()) return;

    onSubmit({
      rating,
      feedback: feedback.trim(),
    });
  }

  // Show success message
  if (reviewSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
          <div className="text-center">
            <div className="mb-4 text-6xl">✓</div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Review Submitted!
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Thank you for sharing your feedback about {targetName}
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Leave a Review
            </h2>
            <p className="mt-2 text-lg text-slate-500">
              Share your experience working with {targetName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xl font-medium text-slate-900">Rating</p>

          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-5xl ${
                  star <= rating ? "text-yellow-400" : "text-slate-300"
                }`}
              >
                ★
              </button>
            ))}

            <span className="ml-3 text-xl text-slate-600">
              {rating ? LABELS[rating] : ""}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xl font-medium text-slate-900">Feedback</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            className="h-40 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 text-lg font-medium text-slate-700 hover:bg-slate-50"
            disabled={loading}
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !rating || !feedback.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            type="button"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}