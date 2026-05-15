import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Users,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { getMyJobs, deleteJob } from "../api/jobs";
import { getApplicationsForJob } from "../api/applications";
import DashboardHeader from "../components/DashboardHeader";
import Modal from "../components/Modal";
import CreateJobForm from "../components/CreateJobForm";
import JobStatusBadge from "../components/JobStatusBadge";
import ApplicantsModal from "../components/ApplicantsModal";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

function formatLocation(job) {
  return [job.area, job.city, job.state, job.country].filter(Boolean).join(", ");
}

function getStatusProgress(status) {
  switch (status) {
    case "OPEN":
      return 20;
    case "ASSIGNED":
      return 50;
    case "IN_PROGRESS":
      return 75;
    case "COMPLETED":
      return 100;
    default:
      return 10;
  }
}

function formatDeadline(job) {
  if (!job.deadline_value || !job.deadline_unit) return "No deadline set";
  return `${job.deadline_value} ${job.deadline_unit}`;
}

export default function PosterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [activeTab, setActiveTab] = useState("ACTIVE");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState(null);
  const [applicantCounts, setApplicantCounts] = useState({});

  useEffect(() => {
    if (!user) return;

    if (!user.poster_profile) {
      navigate("/setup/poster");
      return;
    }

    loadJobs();
  }, [user, navigate]);

  async function loadApplicantCounts(jobList) {
    try {
      const counts = {};

      for (const job of jobList) {
        const items = await getApplicationsForJob(job.id);
        counts[job.id] = items.length;
      }

      setApplicantCounts(counts);
    } catch (err) {
      console.error("Failed to load applicant counts", err);
    }
  }

  async function loadJobs() {
    try {
      setJobsError("");
      setLoadingJobs(true);

      const data = await getMyJobs();
      setJobs(data);
      await loadApplicantCounts(data);
    } catch (err) {
      setJobsError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }

  function handleCreateSuccess() {
    setShowCreateModal(false);
    loadJobs();
  }

  function handleEditSuccess() {
    setEditingJob(null);
    loadJobs();
  }

  async function handleDeleteJob(jobId) {
    const confirmed = window.confirm("Do you want to delete this job?");
    if (!confirmed) return;

    try {
      await deleteJob(jobId);
      loadJobs();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to delete job");
    }
  }

  const activeJobItems = jobs.filter((job) => job.status !== "COMPLETED");

  const awaitingPaymentJobItems = jobs.filter(
    (job) => job.status === "COMPLETED" && job.payment_status !== "PAID"
  );

  const paidJobItems = jobs.filter(
    (job) => job.status === "COMPLETED" && job.payment_status === "PAID"
  );

  const activeJobs = activeJobItems.length;
  const awaitingPaymentJobs = awaitingPaymentJobItems.length;
  const paidJobs = paidJobItems.length;

  const totalSpent = paidJobItems.reduce(
    (sum, job) =>
      sum + Number(job.final_price || job.budget_max || job.budget_min || 0),
    0
  );

  const visibleJobs =
    activeTab === "ACTIVE"
      ? activeJobItems
      : activeTab === "AWAITING_PAYMENT"
      ? awaitingPaymentJobItems
      : paidJobItems;

  if (!user?.poster_profile) {
    return <div className="p-6">Loading poster dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f2ff]">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 px-5 py-5 text-white shadow-sm sm:px-8 sm:py-7">
          <h1 className="text-xl font-bold sm:text-2xl">
            Welcome back, Poster!
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/90 sm:text-base">
            Ready to find talented workers for your projects?
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Jobs" value={activeJobs} icon={<Briefcase />} />

          <StatCard
            title="Awaiting Payment"
            value={awaitingPaymentJobs}
            icon={<Clock />}
          />

          <StatCard
            title="Completed & Paid"
            value={paidJobs}
            icon={<CheckCircle />}
          />

          <StatCard
            title="Total Spent"
            value={money(totalSpent)}
            icon={<DollarSign />}
          />
        </section>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              icon={<Plus />}
              title="Post New Job"
              subtitle="Create listing"
              onClick={() => setShowCreateModal(true)}
            />

            <QuickAction
              icon={<Users />}
              title="View Applicants"
              subtitle="Review applications"
              onClick={() => {
                const firstJobWithApplicants = jobs.find(
                  (job) => (applicantCounts[job.id] || 0) > 0
                );

                if (firstJobWithApplicants) {
                  setSelectedApplicantsJob(firstJobWithApplicants);
                } else {
                  alert("No applicants yet.");
                }
              }}
            />

            <QuickAction
              icon={<Clock />}
              title="Active Projects"
              subtitle="Manage work"
              onClick={() => {
                const activeJob = jobs.find((job) => job.status !== "COMPLETED");
                if (activeJob) navigate(`/poster/jobs/${activeJob.id}`);
                else alert("No active projects yet.");
              }}
            />
          </div>
        </section>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Your Posted Jobs
            </h2>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-700 sm:w-auto"
              type="button"
            >
              + Post a Job
            </button>
          </div>

          <div className="-mx-5 mb-5 overflow-x-auto border-b border-slate-200 px-5 sm:mx-0 sm:px-0">
            <div className="flex min-w-max">
              <TabButton
                label={`Active (${activeJobs})`}
                isActive={activeTab === "ACTIVE"}
                onClick={() => setActiveTab("ACTIVE")}
              />

              <TabButton
                label={`Awaiting Payment (${awaitingPaymentJobs})`}
                isActive={activeTab === "AWAITING_PAYMENT"}
                onClick={() => setActiveTab("AWAITING_PAYMENT")}
              />

              <TabButton
                label={`Paid (${paidJobs})`}
                isActive={activeTab === "PAID"}
                onClick={() => setActiveTab("PAID")}
              />
            </div>
          </div>

          {loadingJobs ? (
            <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
              Loading jobs...
            </div>
          ) : jobsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {jobsError}
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-6 text-center sm:p-10">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {activeTab === "ACTIVE"
                  ? "No active jobs"
                  : activeTab === "AWAITING_PAYMENT"
                  ? "No jobs awaiting payment"
                  : "No paid jobs"}
              </h3>

              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                {activeTab === "ACTIVE"
                  ? "Post a new job to get started."
                  : activeTab === "AWAITING_PAYMENT"
                  ? "Completed jobs that need payment will appear here."
                  : "Paid completed jobs will appear here."}
              </p>

              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
                type="button"
              >
                Create Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job) =>
                activeTab === "ACTIVE" ? (
                  <ActiveJobCard
                    key={job.id}
                    job={job}
                    applicantCount={applicantCounts[job.id] || 0}
                    onViewDetails={() => navigate(`/poster/jobs/${job.id}`)}
                    onMessageWorker={() => navigate(`/chat?jobId=${job.id}`)}
                    onApplicants={() => setSelectedApplicantsJob(job)}
                  />
                ) : (
                  <CompletedJobCard
                    key={job.id}
                    job={job}
                    applicantCount={applicantCounts[job.id] || 0}
                    onViewDetails={() => navigate(`/poster/jobs/${job.id}`)}
                    onPayment={() => navigate(`/poster/jobs/${job.id}/payment`)}
                    onEdit={() => setEditingJob(job)}
                    onDelete={() => handleDeleteJob(job.id)}
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
      >
        <CreateJobForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job"
      >
        {editingJob && (
          <CreateJobForm
            mode="edit"
            initialValues={editingJob}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingJob(null)}
          />
        )}
      </Modal>

      {selectedApplicantsJob && (
        <ApplicantsModal
          isOpen={!!selectedApplicantsJob}
          onClose={() => setSelectedApplicantsJob(null)}
          job={selectedApplicantsJob}
        />
      )}
    </div>
  );
}

function ActiveJobCard({
  job,
  applicantCount,
  onViewDetails,
  onMessageWorker,
  onApplicants,
}) {
  const progress = getStatusProgress(job.status);
  const hasWorker = job.status !== "OPEN";

  return (
    <article className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-5">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold text-slate-950 sm:text-xl">
            {job.title}
          </h3>

          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-600">
            {job.description?.length > 130
              ? `${job.description.slice(0, 130)}...`
              : job.description}
          </p>
        </div>

        <div className="shrink-0">
          <JobStatusBadge status={job.status} />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-600">
          <span>Project Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-200">
          <div
            className="h-2.5 rounded-full bg-blue-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-200 pb-5 text-sm text-slate-700">
        <span className="font-medium">
          {money(job.final_price || job.budget_max || job.budget_min)}
        </span>

        <span>Deadline: {formatDeadline(job)}</span>

        <span className="break-words">
          {formatLocation(job) || "No location added"}
        </span>

        {!hasWorker && <span>{applicantCount} applicant(s)</span>}
      </div>

      <div className="mt-5 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        {hasWorker ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl">
              👷
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Assigned Worker
              </p>
              <p className="text-xs text-slate-500">
                Worker selected for this job
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              No worker assigned yet
            </p>
            <p className="text-xs text-slate-500">
              Review applicants and assign a worker to start the job
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button
            onClick={onViewDetails}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            type="button"
          >
            View Details
          </button>

          {hasWorker ? (
            <button
              onClick={onMessageWorker}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              type="button"
            >
              Message Worker
            </button>
          ) : (
            <button
              onClick={onApplicants}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              type="button"
            >
              View Applicants
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CompletedJobCard({
  job,
  applicantCount,
  onViewDetails,
  onPayment,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-5">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-slate-950 sm:text-lg">
            {job.title}
          </h3>

          <p className="mt-1 break-words text-sm leading-6 text-slate-600">
            {job.description?.length > 90
              ? `${job.description.slice(0, 90)}...`
              : job.description}
          </p>
        </div>

        <div className="shrink-0">
          <JobStatusBadge status={job.status} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 pb-4 text-sm text-slate-600">
        <span>
          {money(job.final_price || job.budget_max || job.budget_min)}
        </span>

        <span>
          {job.status === "COMPLETED"
            ? `Completed ${formatDate(job.created_at)}`
            : `${applicantCount} applicant(s)`}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {job.status === "COMPLETED" && job.payment_status === "PAID"
              ? "Payment completed"
              : "Payment pending"}
          </p>

          <p className="break-words text-xs text-slate-500">
            {formatLocation(job) || "No location added"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
          <button
            onClick={onViewDetails}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            type="button"
          >
            View Details
          </button>

          {job.status === "COMPLETED" && job.payment_status === "PAID" ? (
            <span className="rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-semibold text-green-700">
              Paid
            </span>
          ) : job.status === "COMPLETED" ? (
            <button
              onClick={onPayment}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              type="button"
            >
              Release Payment
            </button>
          ) : null}

          <button
            onClick={onEdit}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-3 break-words text-xl font-semibold text-slate-950 sm:text-2xl">
            {value}
          </p>
        </div>

        <div className="shrink-0 text-purple-600 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left hover:bg-slate-50 sm:px-5"
      type="button"
    >
      <div className="shrink-0 text-fuchsia-600 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950">{title}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}