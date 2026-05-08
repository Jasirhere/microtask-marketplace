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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 px-8 py-7 text-white shadow-sm">
          <h1 className="text-2xl font-bold">Welcome back, Poster!</h1>
          <p className="mt-2 text-sm font-medium text-white/90">
            Ready to find talented workers for your projects?
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
        <StatCard title="Active Jobs" value={activeJobs} icon={<Briefcase />} />
        <StatCard title="Awaiting Payment" value={awaitingPaymentJobs} icon={<Clock />} />
        <StatCard title="Completed & Paid" value={paidJobs} icon={<CheckCircle />} />
        <StatCard title="Total Spent" value={money(totalSpent)} icon={<DollarSign />} />
        </section>

        <section className="mt-6 rounded-2xl bg-white p-7 shadow">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
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

        <section className="mt-7 rounded-2xl bg-white p-7 shadow">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Posted Jobs</h2>

            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
            >
              + Post a Job
            </button>
          </div>

        <div className="mb-5 flex border-b border-slate-200">
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

          {loadingJobs ? (
            <div className="rounded-xl border p-6">Loading jobs...</div>
          ) : jobsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              {jobsError}
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="rounded-xl border p-10 text-center">
              <h3 className="text-lg font-semibold">
                {activeTab === "ACTIVE"
                  ? "No active jobs"
                  : activeTab === "AWAITING_PAYMENT"
                  ? "No jobs awaiting payment"
                  : "No paid jobs"}
              </h3>
              <p className="mt-2 text-slate-600">
                {activeTab === "ACTIVE"
                  ? "Post a new job to get started."
                  : activeTab === "AWAITING_PAYMENT"
                  ? "Completed jobs that need payment will appear here."
                  : "Paid completed jobs will appear here."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
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
                  <div key={job.id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">{job.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.description?.length > 90
                            ? `${job.description.slice(0, 90)}...`
                            : job.description}
                        </p>
                      </div>

                      <JobStatusBadge status={job.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-slate-200 pb-4 text-sm text-slate-600">
                      <span>
                        {money(job.final_price || job.budget_max || job.budget_min)}
                      </span>

                      <span>
                        {job.status === "COMPLETED"
                          ? `Completed ${formatDate(job.created_at)}`
                          : `${applicantCounts[job.id] || 0} applicant(s)`}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {job.status === "COMPLETED" && job.payment_status === "PAID"
                            ? "Payment completed"
                            : "Payment pending"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatLocation(job) || "No location added"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/poster/jobs/${job.id}`)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          View Details
                        </button>

                        {job.status === "COMPLETED" && job.payment_status === "PAID" ? (
                          <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                            Paid
                          </span>
                        ) : job.status === "COMPLETED" ? (
                          <button
                            onClick={() => navigate(`/poster/jobs/${job.id}/payment`)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Release Payment
                          </button>
                        ) : null}

                        <button
                          onClick={() => setEditingJob(job)}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
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
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{job.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {job.description?.length > 130
              ? `${job.description.slice(0, 130)}...`
              : job.description}
          </p>
        </div>

        <JobStatusBadge status={job.status} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
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

      <div className="mt-5 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-5 text-sm text-slate-700">
        <span className="font-medium">
          {money(job.final_price || job.budget_max || job.budget_min)}
        </span>

        <span>Deadline: {formatDeadline(job)}</span>

        <span>{formatLocation(job) || "No location added"}</span>

        {!hasWorker && <span>{applicantCount} applicant(s)</span>}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        {hasWorker ? (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl">
              👷
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Assigned Worker
              </p>
              <p className="text-xs text-slate-500">
                Worker selected for this job
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-900">
              No worker assigned yet
            </p>
            <p className="text-xs text-slate-500">
              Review applicants and assign a worker to start the job
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            View Details
          </button>

          {hasWorker ? (
            <button
              onClick={onMessageWorker}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Message Worker
            </button>
          ) : (
            <button
              onClick={onApplicants}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Applicants
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
        </div>

        <div className="text-purple-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50"
    >
      <div className="text-fuchsia-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>

      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}