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
    return <div className="p-6">Loading payment details...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return <div className="p-6">Job not found.</div>;
  }

  if (job.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/poster"
            className="mb-6 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              Payment is not available yet
            </h1>
            <p className="mt-2 text-slate-600">
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
      <header className="border-b bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/poster"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">{job.title}</h1>
              <p className="mt-2 text-slate-600">{job.description}</p>
            </div>

            <JobStatusBadge status={job.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">Job Details</h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Start Date</p>
                  <p className="font-semibold text-slate-950">
                    {formatDate(job.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Completed Date</p>
                  <p className="font-semibold text-slate-950">
                    {formatDate(job.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Worker Information
            </h2>

            <div className="mt-6 flex items-center gap-5">
              {job.selected_worker_photo_data_url ? (
                <img
                  src={job.selected_worker_photo_data_url}
                  alt={job.selected_worker_name || "Worker"}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                  👷
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {job.selected_worker_name || "Assigned Worker"}
                </h3>
                <p className="text-slate-600">
                  {job.selected_worker_bio || "Worker assigned to this job"}
                </p>

                <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
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

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Ready to Release Payment
                </h2>
                <p className="mt-2 text-slate-700">
                  The job has been completed by both parties.
                </p>
              </div>

              <Clock className="h-6 w-6 text-blue-600" />
            </div>

            <div className="rounded-xl bg-white p-5">
              <div className="flex justify-between py-2 text-slate-700">
                <span>Worker</span>
                <span className="font-medium text-slate-950">
                  {job.selected_worker_name || "Assigned Worker"}
                </span>
              </div>

              <div className="flex justify-between py-2 text-slate-700">
                <span>Job Title</span>
                <span className="font-medium text-slate-950">{job.title}</span>
              </div>

              <div className="mt-3 flex justify-between border-t pt-5">
                <span className="text-lg font-semibold text-slate-950">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {money(jobAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleFakePayment}
              disabled={creatingIntent}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <CreditCard className="h-5 w-5" />
              {creatingIntent ? "Preparing Stripe..." : "Pay & Release Funds"}
            </button>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Payment Summary</h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Job Amount</span>
              <span className="font-semibold text-slate-950">
                {money(jobAmount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Platform Fee (5%)</span>
              <span className="font-semibold text-slate-950">
                {money(platformFee)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-4 text-lg">
              <span className="font-semibold text-slate-950">Total</span>
              <span className="font-bold text-slate-950">{money(total)}</span>
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