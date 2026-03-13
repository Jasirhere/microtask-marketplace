import { useState } from "react";
import Modal from "./Modal";
import { applyToJob } from "../api/applications";

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
        <p className="text-slate-600">
          Submit your application for <span className="font-semibold">"{job?.title}"</span>
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Your Proposed Rate ($)
          </label>
          <input
            type="number"
            name="proposed_rate"
            value={form.proposed_rate}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. 650"
            required
          />
          {job && (
            <p className="mt-2 text-sm text-slate-500">
              Job budget: ${job.budget_min}-{job.budget_max}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Cover Letter</label>
          <textarea
            name="cover_letter"
            value={form.cover_letter}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Explain why you're the best fit for this job..."
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}