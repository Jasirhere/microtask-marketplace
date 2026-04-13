import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkerAssignedJob } from "../api/jobs";
import AssignedJobCompletionActions from "../components/AssignedJobCompletionActions";

export default function WorkerAssignedJobDetail() {
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
      const data = await getWorkerAssignedJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Job not found");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  if (error)
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );

  if (!job) return <div className="p-6">No job found</div>;

  console.log("assigned job data", job);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => navigate("/worker/my-jobs")}
          className="text-slate-600 hover:text-slate-900"
        >
          ← Back
        </button>

        {job.status === "ASSIGNED" && (
          <AssignedJobCompletionActions
            jobId={job.id}
            currentSide="worker"
            revieweeUserId={job.poster_user_id}
            revieweeName={job.poster_name || "Poster"}
            openChat={() => navigate("/chat")}
          />
        )}
      </div>

      <h1 className="text-2xl font-bold">{job.title}</h1>

      <p className="mt-2">Status: {job.status}</p>
      <p className="mt-2">{job.description}</p>

      <p className="mt-2">
        Budget: {job.budget_min} - {job.budget_max}
      </p>

      <p className="mt-2">
        Location: {job.city}, {job.country}
      </p>

      <p className="mt-2">
        Poster: {job.poster_name}
      </p>
    </div>
  );
}