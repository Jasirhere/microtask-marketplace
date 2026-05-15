import Modal from "./Modal";

export default function CompleteJobConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Job Completion">
      <div className="space-y-5">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
              ✓
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                Mark this job as completed?
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                Please confirm only if the agreed work has been completed. The
                job will move forward once both sides confirm completion.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <p className="font-semibold">Before confirming:</p>

          <p className="mt-1 break-words">
            Make sure there are no pending issues, missing work, or unresolved
            questions with the other party.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Confirming..." : "Yes, Mark Completed"}
          </button>
        </div>
      </div>
    </Modal>
  );
}