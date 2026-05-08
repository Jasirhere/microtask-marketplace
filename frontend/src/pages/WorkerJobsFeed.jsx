import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  DollarSign,
  Filter,
  MapPin,
  Navigation,
  Search,
  Tag,
  X,
} from "lucide-react";

import { getOpenJobs } from "../api/jobs";
import { getMyApplications } from "../api/applications";
import { LOCATION_DATA } from "../data/locations";

import DashboardHeader from "../components/DashboardHeader";
import ApplyJobModal from "../components/ApplyJobModal";

const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing & Content",
  "Moving & Delivery",
  "Home Services",
  "Marketing",
  "Cleaning",
  "Other",
];

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";

  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function money(value) {
  if (value === undefined || value === null || value === "") return "$0";
  return `$${Number(value).toLocaleString()}`;
}

function formatLocation(job) {
  return [job.area, job.city, job.state, job.country].filter(Boolean).join(", ");
}

function getJobSearchText(job) {
  return [
    job.title,
    job.description,
    job.category,
    job.country,
    job.state,
    job.city,
    job.area,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function WorkerJobsFeed() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("NEAREST");

  const [showNearestJobs, setShowNearestJobs] = useState(true);
  const [maxDistance, setMaxDistance] = useState(200);
  const [includeRemoteJobs, setIncludeRemoteJobs] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(5000);

  const [myApplications, setMyApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadJobs();
    loadMyApplications();
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

  async function loadMyApplications() {
    try {
      const data = await getMyApplications();
      setMyApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  }

  function hasApplied(jobId) {
    return myApplications.some((app) => app.job_id === jobId);
  }

  function handleApplyClick(job) {
    setSelectedJob(job);
    setShowApplyModal(true);
  }

  async function handleApplySuccess() {
    setShowApplyModal(false);
    setSuccessMessage("Successfully applied to this job.");
    await loadMyApplications();
  }

  function handleCountryChange(e) {
    setSelectedCountry(e.target.value);
    setSelectedState("");
    setSelectedCities([]);
  }

  function handleStateChange(e) {
    setSelectedState(e.target.value);
    setSelectedCities([]);
  }

  function toggleCity(city) {
    setSelectedCities((prev) =>
      prev.includes(city)
        ? prev.filter((item) => item !== city)
        : [...prev, city]
    );
  }

  function toggleCategory(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  function clearAllFilters() {
    setSearch("");
    setShowNearestJobs(false);
    setMaxDistance(200);
    setIncludeRemoteJobs(false);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCities([]);
    setSelectedCategories([]);
    setBudgetMin(0);
    setBudgetMax(5000);
    setSortBy("NEAREST");
  }

  const selectedCountryData = useMemo(() => {
    return LOCATION_DATA.find((item) => item.country === selectedCountry);
  }, [selectedCountry]);

  const selectedStateData = useMemo(() => {
    return selectedCountryData?.states.find((item) => item.name === selectedState);
  }, [selectedCountryData, selectedState]);

  const stateOptions = selectedCountryData?.states || [];
  const cityOptions = selectedStateData?.cities || [];

  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(Boolean(selectedCountry)) +
    Number(Boolean(selectedState)) +
    selectedCities.length +
    selectedCategories.length +
    Number(budgetMin > 0 || budgetMax < 5000) +
    Number(includeRemoteJobs);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const searchText = getJobSearchText(job);

      const matchesSearch =
        !search.trim() || searchText.includes(search.trim().toLowerCase());

      const matchesCountry = !selectedCountry || job.country === selectedCountry;

      const matchesState = !selectedState || job.state === selectedState;

      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(job.city);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(job.category);

      const jobBudgetMin = Number(job.budget_min || 0);
      const jobBudgetMax = Number(job.budget_max || jobBudgetMin || 0);

      const matchesBudget =
        jobBudgetMax >= budgetMin && jobBudgetMin <= budgetMax;

      const isRemote =
        !job.city ||
        String(job.city).toLowerCase() === "remote" ||
        String(job.location || "").toLowerCase().includes("remote");

      const matchesRemote = includeRemoteJobs || !isRemote;

      return (
        matchesSearch &&
        matchesCountry &&
        matchesState &&
        matchesCity &&
        matchesCategory &&
        matchesBudget &&
        matchesRemote
      );
    });

    if (sortBy === "NEWEST") {
      result = [...result].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    if (sortBy === "BUDGET_HIGH") {
      result = [...result].sort(
        (a, b) => Number(b.budget_max || 0) - Number(a.budget_max || 0)
      );
    }

    if (sortBy === "BUDGET_LOW") {
      result = [...result].sort(
        (a, b) => Number(a.budget_min || 0) - Number(b.budget_min || 0)
      );
    }

    return result;
  }, [
    jobs,
    search,
    selectedCountry,
    selectedState,
    selectedCities,
    selectedCategories,
    budgetMin,
    budgetMax,
    includeRemoteJobs,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-[#f3f7ff]">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-7">
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                Find Your Next Opportunity
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Discover jobs that match your skills, location preferences, and
                budget expectations. Use our advanced filters to find the perfect
                opportunity.
              </p>
            </div>

            <div className="flex h-24 w-28 shrink-0 flex-col items-center justify-center rounded-2xl bg-indigo-100 text-blue-700">
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="mt-1 text-xs text-slate-700">Jobs Available</p>
            </div>
          </div>
        </section>

        {successMessage && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[330px_1fr]">
          <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-fuchsia-600 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h2 className="font-semibold">Advanced Filters</h2>
              </div>

              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            </div>

            <div className="space-y-6 p-5">
              <FilterSection
                icon={<MapPin className="h-4 w-4 text-blue-500" />}
                title="Location"
                onClear={() => {
                  setSelectedCountry("");
                  setSelectedState("");
                  setSelectedCities([]);
                  setIncludeRemoteJobs(false);
                }}
              >
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={showNearestJobs}
                      onChange={(e) => setShowNearestJobs(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Show Nearest Jobs
                  </label>

                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-blue-700">
                      Max Distance (miles)
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="mt-1 text-right text-xs font-semibold text-blue-700">
                      {maxDistance} miles
                    </div>
                    <p className="mt-1 text-xs text-red-500">
                      📍 Using your location
                    </p>
                  </div>
                </div>

                <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeRemoteJobs}
                    onChange={(e) => setIncludeRemoteJobs(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  Include Remote Jobs
                </label>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                    >
                      <option value="">Select country</option>
                      {LOCATION_DATA.map((item) => (
                        <option key={item.country} value={item.country}>
                          {item.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Province / State
                    </label>
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      disabled={!selectedCountry}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-400"
                    >
                      <option value="">
                        {selectedCountry
                          ? "Select province / state"
                          : "Select country first"}
                      </option>
                      {stateOptions.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-medium text-slate-600">
                      Cities ({selectedCities.length} selected)
                    </div>

                    <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3">
                      {!selectedState ? (
                        <p className="text-xs text-slate-500">
                          Select province / state first.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {cityOptions.map((city) => (
                            <label
                              key={city}
                              className="flex items-center gap-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCities.includes(city)}
                                onChange={() => toggleCity(city)}
                                className="h-4 w-4 rounded"
                              />
                              {city}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FilterSection>

              <FilterSection
                icon={<Tag className="h-4 w-4 text-fuchsia-500" />}
                title="Category"
              >
                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 rounded"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                icon={<DollarSign className="h-4 w-4 text-green-500" />}
                title="Budget Range"
              >
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full"
                />

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />

                  <span className="text-slate-400">-</span>

                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>$0</span>
                  <span>${budgetMax.toLocaleString()}</span>
                </div>
              </FilterSection>
            </div>
          </aside>

          <section>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-blue-400"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-400 md:w-56"
              >
                <option value="NEAREST">Nearest First</option>
                <option value="NEWEST">Newest First</option>
                <option value="BUDGET_HIGH">Highest Budget</option>
                <option value="BUDGET_LOW">Lowest Budget</option>
              </select>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium">Active Filters:</span>

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCountry && (
                  <FilterPill label={selectedCountry} onRemove={() => {
                    setSelectedCountry("");
                    setSelectedState("");
                    setSelectedCities([]);
                  }} />
                )}

                {selectedState && (
                  <FilterPill label={selectedState} onRemove={() => {
                    setSelectedState("");
                    setSelectedCities([]);
                  }} />
                )}

                {selectedCities.map((city) => (
                  <FilterPill
                    key={city}
                    label={city}
                    onRemove={() => toggleCity(city)}
                  />
                ))}

                {selectedCategories.map((category) => (
                  <FilterPill
                    key={category}
                    label={category}
                    onRemove={() => toggleCategory(category)}
                  />
                ))}

                {activeFilterCount === 0 && (
                  <span className="text-slate-500">No filters selected</span>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              Found {filteredJobs.length} job{filteredJobs.length === 1 ? "" : "s"}{" "}
              {sortBy === "NEAREST"
                ? "sorted by nearest location"
                : sortBy === "NEWEST"
                ? "sorted by newest first"
                : sortBy === "BUDGET_HIGH"
                ? "sorted by highest budget"
                : "sorted by lowest budget"}
            </p>

            <div className="mt-6">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  Loading jobs...
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-950">
                    No jobs found
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Try adjusting your filters or search terms to find more
                    opportunities.
                  </p>

                  <button
                    onClick={clearAllFilters}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applied={hasApplied(job.id)}
                      onView={() => navigate(`/worker/jobs/${job.id}`)}
                      onApply={() => handleApplyClick(job)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {selectedJob && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={selectedJob}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}

function FilterSection({ icon, title, onClear, children }) {
  return (
    <section className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Clear
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      {label}
      <button type="button" onClick={onRemove} className="text-slate-500">
        ×
      </button>
    </span>
  );
}

function JobCard({ job, applied, onView, onApply }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{job.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {job.description}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {job.category || "General"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>{formatLocation(job) || "Remote / Not set"}</span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <span>
            {money(job.budget_min)} - {money(job.budget_max)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <span>{formatTimeAgo(job.created_at)}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onView}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          View Details
        </button>

        {applied ? (
          <button
            disabled
            className="rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700"
          >
            Applied
          </button>
        ) : (
          <button
            onClick={onApply}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply Now
          </button>
        )}
      </div>
    </article>
  );
}