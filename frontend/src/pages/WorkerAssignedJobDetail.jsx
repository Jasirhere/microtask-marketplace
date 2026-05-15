import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkerAssignedJob } from "../api/jobs";
import AssignedJobCompletionActions from "../components/AssignedJobCompletionActions";

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

function formatLocation(job) {
  return [job.area, job.city, job.state, job.country].filter(Boolean).join(", ");
}

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
      setLoading(true);
      setError("");

      const data = await getWorkerAssignedJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Job not found");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading job...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/worker/my-jobs")}
            className="mb-5 text-sm font-medium text-slate-600 hover:text-slate-900"
            type="button"
          >
            ← Back to My Jobs
          </button>

          <div className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No job found.
        </div>
      </div>
    );
  }

  const skills = Array.isArray(job.skills_required) ? job.skills_required : [];
  const canComplete = job.status === "ASSIGNED";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/worker/my-jobs")}
            className="w-fit text-sm font-medium text-slate-600 hover:text-slate-900"
            type="button"
          >
            ← Back to My Jobs
          </button>

          {canComplete && (
            <div className="w-full sm:w-auto">
              <AssignedJobCompletionActions
                jobId={job.id}
                currentSide="worker"
                revieweeUserId={job.poster_user_id}
                revieweeName={job.poster_name || "Poster"}
                openChat={() => navigate("/chat")}
              />
            </div>
          )}
        </div>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <header className="border-b border-slate-200 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                  {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {job.status}
                  </span>

                  {job.category && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {job.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 px-4 py-3 text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Budget
                </p>

                <p className="mt-1 break-words text-xl font-bold text-green-700 sm:text-2xl">
                  {money(job.final_price || job.budget_max || job.budget_min)}
                </p>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-7 lg:p-8">
            <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoBlock label="Status" value={job.status || "Not set"} />

              <InfoBlock
                label="Budget Range"
                value={`${money(job.budget_min)} - ${money(job.budget_max)}`}
              />

              <InfoBlock
                label="Location"
                value={formatLocation(job) || "Location not set"}
              />

              <InfoBlock
                label="Poster"
                value={job.poster_name || "Poster"}
              />

              <InfoBlock
                label="Deadline"
                value={
                  job.deadline_value && job.deadline_unit
                    ? `${job.deadline_value} ${job.deadline_unit}`
                    : "Not set"
                }
              />

              <InfoBlock
                label="Duration"
                value={
                  job.estimated_duration_value && job.estimated_duration_unit
                    ? `${job.estimated_duration_value} ${job.estimated_duration_unit}`
                    : "Not set"
                }
              />
            </section>

            <section className="mb-7 border-t border-slate-200 pt-7">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:text-xl">
                Job Description
              </h2>

              <p className="break-words text-sm leading-7 text-slate-700 sm:text-base">
                {job.description}
              </p>
            </section>

            {job.address_details && (
              <section className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Address Details
                </h2>

                <p className="break-words text-sm leading-6 text-slate-700">
                  {job.address_details}
                </p>
              </section>
            )}

            <section className="mb-7">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:text-xl">
                Skills Required
              </h2>

              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No specific skills listed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="max-w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700"
                    >
                      <span className="break-words">{skill}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {job.notes && (
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Notes
                </h2>

                <p className="break-words text-sm leading-6 text-slate-700">
                  {job.notes}
                </p>
              </section>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-4">
      <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>

      <p className="break-words text-base font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}