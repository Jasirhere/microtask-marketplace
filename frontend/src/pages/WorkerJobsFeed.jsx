import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOpenJobs } from "../api/jobs";
import DashboardHeader from "../components/DashboardHeader";


function formatTimeAgo(dateString) {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing & Content",
  "Moving & Delivery",
  "Home Services",
  "Marketing",
  "Other",
];

const LOCATION_OPTIONS = [
  "Remote",
  "Karachi, Pakistan",
  "Lahore, Pakistan",
  "Islamabad, Pakistan",
  "Rawalpindi, Pakistan",
  "Dubai, UAE",
  "London, UK",
];

export default function WorkerJobsFeed() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(5000);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");
      const data = await getOpenJobs();
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  function toggleLocation(location) {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((item) => item !== location)
        : [...prev, location]
    );
  }

  function mapJobLocation(job) {
    if (!job.city && !job.country) return "Remote";
    return `${job.city}, ${job.country}`;
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobLocation = mapJobLocation(job);

      const matchesSearch =
        search.trim() === "" ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(job.category);

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(jobLocation) ||
        (selectedLocations.includes("Remote") && !job.city);

      const matchesBudget =
        Number(job.budget_min) >= budgetMin &&
        Number(job.budget_max) <= budgetMax;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesBudget
      );
    });
  }, [jobs, search, selectedCategories, selectedLocations, budgetMin, budgetMax]);

  return (
  <div className="min-h-screen bg-slate-50">
    <DashboardHeader />

    <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Find Jobs</h1>
            <p className="mt-2 text-lg text-slate-600">
              Browse and apply to available jobs
            </p>
          </div>

          
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* LEFT FILTER SIDEBAR */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm h-fit">
            <div className="mb-8 flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <h2 className="text-2xl font-semibold text-slate-900">Filters</h2>
            </div>

            {/* CATEGORY */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Category
              </h3>

              <div className="space-y-3">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category} className="flex items-center gap-3 text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* BUDGET */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Budget Range
              </h3>

              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full rounded-xl border px-3 py-2"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Location
              </h3>

              <div className="space-y-3">
                {LOCATION_OPTIONS.map((location) => (
                  <label key={location} className="flex items-center gap-3 text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location)}
                      onChange={() => toggleLocation(location)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div>
            {/* SEARCH BAR */}
            <div className="mb-8">
              <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-none bg-transparent text-lg outline-none"
                />
              </div>
            </div>

            {/* JOB GRID */}
            {loading ? (
              <div className="rounded-2xl border bg-white p-6">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center">
                <h3 className="text-xl font-semibold text-slate-900">
                  No jobs found
                </h3>
                <p className="mt-2 text-slate-600">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-3xl border bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-semibold leading-snug text-slate-900">
                        {job.title}
                      </h3>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {job.category}
                      </span>
                    </div>

                    <p className="mb-5 text-base leading-7 text-slate-600">
                      {job.description.length > 140
                        ? `${job.description.slice(0, 140)}...`
                        : job.description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-6 text-base text-slate-700">
                      <div>📍 {mapJobLocation(job)}</div>
                      <div>
                        💲 {job.budget_min}-{job.budget_max}
                      </div>
                    </div>

                    <div className="mb-5 text-sm text-slate-500">
                      {formatTimeAgo(job.created_at)}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/worker/jobs/${job.id}`)}
                        className="rounded-xl border px-4 py-3 font-medium hover:bg-slate-50"
                      >
                        View Details
                      </button>

                      <button
                        className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}