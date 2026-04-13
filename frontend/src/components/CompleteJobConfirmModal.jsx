export default function CompleteJobConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-3xl font-semibold text-slate-900">
          Mark Job as Completed?
        </h2>

        <p className="mt-4 text-lg text-slate-500">
          This will mark the job as completed. You&apos;ll be able to leave a review after confirming.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 text-lg font-medium text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}