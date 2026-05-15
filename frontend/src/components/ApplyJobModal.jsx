import { useState } from "react";
import Modal from "./Modal";
import { applyToJob } from "../api/applications";

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

export default function ApplyJobModal({ isOpen, onClose, job, onSuccess }) {
  const [form, setForm] = useState({
    proposed_rate: "",
    cover_letter: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await applyToJob({
        job_id: job.id,
        proposed_rate: Number(form.proposed_rate),
        cover_letter: form.cover_letter.trim() || null,
      });

      setForm({
        proposed_rate: "",
        cover_letter: "",
      });

      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to apply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for this job">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            You are applying for
          </p>

          <h3 className="mt-1 break-words text-base font-bold text-slate-950 sm:text-lg">
            {job?.title}
          </h3>

          {job && (
            <p className="mt-2 break-words text-sm text-slate-600">
              Job budget:{" "}
              <span className="font-semibold text-slate-900">
                {money(job.budget_min)} - {money(job.budget_max)}
              </span>
            </p>
          )}
        </div>

        {error && (
          <div className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Your Proposed Rate ($)
          </label>

          <input
            type="number"
            name="proposed_rate"
            value={form.proposed_rate}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
            placeholder="e.g. 650"
            required
            min="1"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Cover Letter
          </label>

          <textarea
            name="cover_letter"
            value={form.cover_letter}
            onChange={handleChange}
            rows={5}
            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
            placeholder="Explain why you're the best fit for this job..."
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}