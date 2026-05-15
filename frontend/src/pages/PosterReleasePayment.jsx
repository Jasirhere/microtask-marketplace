import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, CheckCircle, Clock, CreditCard } from "lucide-react";

import StripePaymentModal from "../components/StripePaymentModal";
import { createPaymentIntent, markJobPaid } from "../api/payments";
import { getApplicationsForJob } from "../api/applications";
import { getJobById } from "../api/jobs";
import JobStatusBadge from "../components/JobStatusBadge";

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PosterReleasePayment() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [creatingIntent, setCreatingIntent] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    try {
      setLoading(true);
      setError("");

      const data = await getJobById(jobId);
      setJob(data);

      const applications = await getApplicationsForJob(jobId);
      const selected = applications.find((app) => app.status === "SELECTED");

      setSelectedApplication(selected || null);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load payment page");
    } finally {
      setLoading(false);
    }
  }

  async function handleFakePayment() {
    try {
      setCreatingIntent(true);

      const data = await createPaymentIntent(jobId);

      setClientSecret(data.client_secret);
      setPaymentIntentId(data.payment_intent_id);
      setShowStripeModal(true);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to start Stripe payment.");
    } finally {
      setCreatingIntent(false);
    }
  }

  function handlePaymentSuccess() {
    setShowStripeModal(false);
    alert("Payment released successfully.");
    navigate("/poster");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading payment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/poster"
            className="mb-5 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

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
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Job not found.
        </div>
      </div>
    );
  }

  if (job.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/poster"
            className="mb-5 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h1 className="break-words text-xl font-bold text-slate-900">
              Payment is not available yet
            </h1>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600 sm:text-base">
              Payment can only be released after the job is completed by both
              parties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const jobAmount = Number(
    job.final_price ||
      selectedApplication?.proposed_rate ||
      job.budget_max ||
      job.budget_min ||
      0
  );

  const platformFee = jobAmount * 0.05;
  const total = jobAmount + platformFee;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            to="/poster"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                {job.title}
              </h1>

              <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-600 sm:text-base">
                {job.description}
              </p>
            </div>

            <div className="shrink-0">
              <JobStatusBadge status={job.status} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="break-words text-xl font-bold text-slate-950">
              Job Details
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<Calendar className="h-6 w-6 text-slate-400" />}
                label="Start Date"
                value={formatDate(job.created_at)}
              />

              <InfoRow
                icon={<CheckCircle className="h-6 w-6 text-slate-400" />}
                label="Completed Date"
                value={formatDate(job.completed_at || job.created_at)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="break-words text-xl font-bold text-slate-950">
              Worker Information
            </h2>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              {job.selected_worker_photo_data_url ? (
                <img
                  src={job.selected_worker_photo_data_url}
                  alt={job.selected_worker_name || "Worker"}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-3xl">
                  👷
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-lg font-bold text-slate-950">
                  {job.selected_worker_name || "Assigned Worker"}
                </h3>

                <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                  {job.selected_worker_bio || "Worker assigned to this job"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span>
                    <span className="text-yellow-500">★</span>{" "}
                    {job.selected_worker_rating || 4.9}
                  </span>

                  <span>
                    {job.selected_worker_completed_jobs_count || 0} jobs
                    completed
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold text-slate-950">
                  Ready to Release Payment
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-slate-700 sm:text-base">
                  The job has been completed by both parties.
                </p>
              </div>

              <Clock className="h-6 w-6 shrink-0 text-blue-600" />
            </div>

            <div className="rounded-xl bg-white p-4 sm:p-5">
              <SummaryLine
                label="Worker"
                value={job.selected_worker_name || "Assigned Worker"}
              />

              <SummaryLine label="Job Title" value={job.title} />

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-lg font-semibold text-slate-950">
                  Total Amount
                </span>

                <span className="break-words text-2xl font-bold text-blue-600">
                  {money(jobAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleFakePayment}
              disabled={creatingIntent}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:text-base"
              type="button"
            >
              <CreditCard className="h-5 w-5 shrink-0" />
              <span className="min-w-0 break-words">
                {creatingIntent ? "Preparing Stripe..." : "Pay & Release Funds"}
              </span>
            </button>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="break-words text-lg font-bold text-slate-950">
            Payment Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            <SummaryLine label="Job Amount" value={money(jobAmount)} />

            <SummaryLine label="Platform Fee (5%)" value={money(platformFee)} />

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-lg sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-950">Total</span>

              <span className="break-words font-bold text-slate-950">
                {money(total)}
              </span>
            </div>
          </div>
        </aside>
      </main>

      <StripePaymentModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        clientSecret={clientSecret}
        amount={jobAmount}
        paymentIntentId={paymentIntentId}
        jobId={jobId}
        onSuccess={handlePaymentSuccess}
        markJobPaid={markJobPaid}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-xl bg-slate-50 p-4">
      <span className="shrink-0">{icon}</span>

      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>

        <p className="break-words font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-2 text-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0">{label}</span>

      <span className="break-words font-medium text-slate-950 sm:text-right">
        {value}
      </span>
    </div>
  );
}