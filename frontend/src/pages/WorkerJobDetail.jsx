import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicJob } from "../api/jobs";

export default function WorkerJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    try {
      const data = await getPublicJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Job not found");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading job...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white border rounded-2xl p-6">

        <button
          onClick={() => navigate("/worker/jobs")}
          className="mb-4 border px-3 py-1 rounded"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold mb-4">{job.title}</h1>

        <p className="mb-3 text-slate-700">{job.description}</p>

        <div className="mb-3">
          <b>Budget:</b> {job.budget_min} - {job.budget_max}
        </div>

        <div className="mb-3">
          <b>Location:</b> {job.area}, {job.city}, {job.country}
        </div>

        <div className="mb-3">
          <b>Category:</b> {job.category}
        </div>

        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Apply for Job
        </button>

      </div>
    </div>
  );
}
