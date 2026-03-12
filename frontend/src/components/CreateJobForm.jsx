import { useEffect, useState } from "react";
import { createJob, getJobCategories } from "../api/jobs";

const COUNTRY_OPTIONS = ["Pakistan", "United Kingdom", "UAE"];

const CITY_OPTIONS = {
  Pakistan: [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Hyderabad",
    "Quetta",
  ],
  "United Kingdom": ["London", "Manchester", "Birmingham"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
};

export default function CreateJobForm({ onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",

    country: "",
    city: "",
    area: "",
    address_details: "",
    latitude: null,
    longitude: null,

    budget_min: "",
    budget_max: "",

    deadline_value: "",
    deadline_unit: "days",

    estimated_duration_value: "",
    estimated_duration_unit: "hours",

    skills_required: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getJobCategories();
        setCategories(data);
        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            category: data[0],
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  const cityOptions = form.country ? CITY_OPTIONS[form.country] || [] : [];

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "country") {
      setForm((prev) => ({
        ...prev,
        country: value,
        city: "",
        area: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,

        country: form.country,
        city: form.city,
        area: form.area.trim(),
        address_details: form.address_details.trim() || null,
        latitude: form.latitude,
        longitude: form.longitude,

        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),

        deadline_value: Number(form.deadline_value),
        deadline_unit: form.deadline_unit,

        estimated_duration_value: Number(form.estimated_duration_value),
        estimated_duration_unit: form.estimated_duration_unit,

        skills_required: form.skills_required
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        notes: form.notes.trim() || null,
      };

      await createJob(payload);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCategories) {
    return <div>Loading form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Job Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. Move furniture to new apartment"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Describe the job clearly..."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            required
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            required
          >
            <option value="">Select Country</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            required
            disabled={!form.country}
          >
            <option value="">{form.country ? "Select City" : "Select Country First"}</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Area / Locality</label>
          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. Gulistan-e-Johar"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address Details</label>
          <textarea
            name="address_details"
            value={form.address_details}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="House number, floor, street, landmark..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Budget Min</label>
          <input
            type="number"
            name="budget_min"
            value={form.budget_min}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. 5000"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Budget Max</label>
          <input
            type="number"
            name="budget_max"
            value={form.budget_max}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. 8000"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Deadline</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="deadline_value"
              value={form.deadline_value}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3"
              placeholder="2"
              required
            />
            <select
              name="deadline_unit"
              value={form.deadline_unit}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3"
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
              <option value="weeks">weeks</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Estimated Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="estimated_duration_value"
              value={form.estimated_duration_value}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3"
              placeholder="4"
              required
            />
            <select
              name="estimated_duration_unit"
              value={form.estimated_duration_unit}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3"
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Skills Required</label>
          <input
            name="skills_required"
            value={form.skills_required}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="e.g. lifting, packing, moving"
          />
          <p className="mt-1 text-xs text-slate-500">
            Enter skills separated by commas
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Optional notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-4 py-2 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </div>
    </form>
  );
}