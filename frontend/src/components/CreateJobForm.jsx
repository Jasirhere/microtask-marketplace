import { useEffect, useMemo, useState } from "react";
import { createJob, getJobCategories, updateJob } from "../api/jobs";
import { LOCATION_DATA } from "../data/locations";


export default function CreateJobForm({
  onSuccess,
  onCancel,
  initialValues = null,
  mode = "create",
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",

    country: "",
    state: "",
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
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getJobCategories();
        setCategories(data);

        if (initialValues) {
          setForm({
            title: initialValues.title || "",
            description: initialValues.description || "",
            category: initialValues.category || (data[0] || ""),

            country: initialValues.country || "",
            state: initialValues.state || "",
            city: initialValues.city || "",
            area: initialValues.area || "",
            address_details: initialValues.address_details || "",
            latitude: initialValues.latitude ?? null,
            longitude: initialValues.longitude ?? null,

            budget_min: initialValues.budget_min ?? "",
            budget_max: initialValues.budget_max ?? "",

            deadline_value: initialValues.deadline_value ?? "",
            deadline_unit: initialValues.deadline_unit || "days",

            estimated_duration_value:
              initialValues.estimated_duration_value ?? "",
            estimated_duration_unit:
              initialValues.estimated_duration_unit || "hours",

            skills_required: Array.isArray(initialValues.skills_required)
              ? initialValues.skills_required.join(", ")
              : "",

            notes: initialValues.notes || "",
          });
        } else if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            category: data[0],
          }));
        }
      } catch (err) {
        console.error(err);
        setServerError("Failed to load job categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [initialValues]);

  const selectedCountry = useMemo(() => {
    return LOCATION_DATA.find((item) => item.country === form.country);
  }, [form.country]);

  const selectedState = useMemo(() => {
    return selectedCountry?.states.find((item) => item.name === form.state);
  }, [selectedCountry, form.state]);

  const stateOptions = selectedCountry?.states || [];
  const cityOptions = selectedState?.cities || [];


  function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-red-600">{message}</p>;
  }

  function inputClass(fieldName) {
    return `w-full rounded-xl border px-4 py-3 outline-none ${fieldErrors[fieldName]
      ? "border-red-500 bg-red-50 focus:border-red-500"
      : "focus:border-blue-500"
      }`;
  }

  function validateForm() {
    const errors = {};

    const title = form.title.trim();
    const description = form.description.trim();
    const area = form.area.trim();
    const addressDetails = form.address_details.trim();
    const notes = form.notes.trim();

    const budgetMin = Number(form.budget_min);
    const budgetMax = Number(form.budget_max);
    const deadlineValue = Number(form.deadline_value);
    const durationValue = Number(form.estimated_duration_value);

    if (!title) {
      errors.title = "Job title is required";
    } else if (title.length < 5) {
      errors.title = "Job title must be at least 5 characters";
    } else if (title.length > 80) {
      errors.title = "Job title cannot exceed 80 characters";
    }

    if (!description) {
      errors.description = "Description is required";
    } else if (description.length < 30) {
      errors.description = "Description must be at least 30 characters";
    } else if (description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (!form.category) {
      errors.category = "Category is required";
    }

    if (!form.country) {
      errors.country = "Country is required";
    }

    if (!form.state) {
      errors.state = "State / province is required";
    }

    if (!form.city) {
      errors.city = "City is required";
    }

    if (!area) {
      errors.area = "Area / locality is required";
    } else if (area.length < 2) {
      errors.area = "Area is too short";
    } else if (area.length > 80) {
      errors.area = "Area cannot exceed 80 characters";
    }

    if (addressDetails.length > 300) {
      errors.address_details = "Address details cannot exceed 300 characters";
    }

    if (!form.budget_min) {
      errors.budget_min = "Minimum budget is required";
    } else if (Number.isNaN(budgetMin) || budgetMin <= 0) {
      errors.budget_min = "Minimum budget must be greater than 0";
    }

    if (!form.budget_max) {
      errors.budget_max = "Maximum budget is required";
    } else if (Number.isNaN(budgetMax) || budgetMax <= 0) {
      errors.budget_max = "Maximum budget must be greater than 0";
    }

    if (form.budget_min && form.budget_max && budgetMin > budgetMax) {
      errors.budget_max = "Maximum budget cannot be less than minimum budget";
    }

    if (!form.deadline_value) {
      errors.deadline_value = "Deadline is required";
    } else if (Number.isNaN(deadlineValue) || deadlineValue <= 0) {
      errors.deadline_value = "Deadline must be greater than 0";
    } else if (form.deadline_unit === "hours" && deadlineValue > 72) {
      errors.deadline_value = "For hours, deadline cannot exceed 72 hours";
    } else if (form.deadline_unit === "days" && deadlineValue > 90) {
      errors.deadline_value = "For days, deadline cannot exceed 90 days";
    } else if (form.deadline_unit === "weeks" && deadlineValue > 12) {
      errors.deadline_value = "For weeks, deadline cannot exceed 12 weeks";
    }

    if (!form.estimated_duration_value) {
      errors.estimated_duration_value = "Estimated duration is required";
    } else if (Number.isNaN(durationValue) || durationValue <= 0) {
      errors.estimated_duration_value = "Duration must be greater than 0";
    } else if (
      form.estimated_duration_unit === "hours" &&
      durationValue > 24
    ) {
      errors.estimated_duration_value =
        "For hours, duration cannot exceed 24 hours";
    } else if (
      form.estimated_duration_unit === "days" &&
      durationValue > 30
    ) {
      errors.estimated_duration_value =
        "For days, duration cannot exceed 30 days";
    }

    if (form.skills_required.trim()) {
      const skills = form.skills_required
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (skills.length > 10) {
        errors.skills_required = "You can add maximum 10 skills";
      }

      const invalidSkill = skills.find((skill) => skill.length > 30);
      if (invalidSkill) {
        errors.skills_required = "Each skill must be under 30 characters";
      }
    }

    if (notes.length > 500) {
      errors.notes = "Notes cannot exceed 500 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "country") {
      setForm((prev) => ({
        ...prev,
        country: value,
        state: "",
        city: "",
        area: "",
      }));

      setFieldErrors((prev) => ({
        ...prev,
        country: "",
        state: "",
        city: "",
        area: "",
      }));

      setServerError("");
      return;
    }

    if (name === "state") {
      setForm((prev) => ({
        ...prev,
        state: value,
        city: "",
        area: "",
      }));

      setFieldErrors((prev) => ({
        ...prev,
        state: "",
        city: "",
        area: "",
      }));

      setServerError("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      setServerError("Please fix the highlighted fields before creating the job.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,

        country: form.country,
        state: form.state,
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

      if (mode === "edit" && initialValues?.id) {
        await updateJob(initialValues.id, payload);
      } else {
        await createJob(payload);
      }

      onSuccess();
    } catch (err) {
      console.error("Create/update job failed:", err);
      console.error("Response data:", err?.response?.data);
      setServerError(err?.response?.data?.detail || "Failed to save job");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCategories) {
    return <div>Loading form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Job Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={inputClass("title")}
            placeholder="e.g. Move furniture to new apartment"
          />
          <div className="mt-1 flex justify-between text-sm">
            <FieldError message={fieldErrors.title} />
            <span className="text-slate-400">{form.title.length}/80</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={inputClass("description")}
            placeholder="Describe the job clearly, including what needs to be done, location context, and any tools needed..."
          />
          <div className="mt-1 flex justify-between text-sm">
            <FieldError message={fieldErrors.description} />
            <span className="text-slate-400">
              {form.description.length}/1000
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass("category")}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.category} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Country *</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className={inputClass("country")}
          >
            <option value="">Select country</option>
            {LOCATION_DATA.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.country} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            State / Province *
          </label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className={inputClass("state")}
            disabled={!form.country}
          >
            <option value="">
              {form.country ? "Select state / province" : "Select country first"}
            </option>

            {stateOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.state} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">City *</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className={inputClass("city")}
            disabled={!form.state}
          >
            <option value="">
              {form.state ? "Select city" : "Select state / province first"}
            </option>

            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.city} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Area / Locality *
          </label>
          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            className={inputClass("area")}
            placeholder="e.g. Gulistan-e-Johar"
          />
          <FieldError message={fieldErrors.area} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Address Details
          </label>
          <textarea
            name="address_details"
            value={form.address_details}
            onChange={handleChange}
            rows={3}
            className={inputClass("address_details")}
            placeholder="House number, floor, street, landmark..."
          />
          <div className="mt-1 flex justify-between text-sm">
            <FieldError message={fieldErrors.address_details} />
            <span className="text-slate-400">
              {form.address_details.length}/300
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Budget Min *
          </label>
          <input
            type="number"
            name="budget_min"
            value={form.budget_min}
            onChange={handleChange}
            className={inputClass("budget_min")}
            placeholder="e.g. 5000"
            min="1"
          />
          <FieldError message={fieldErrors.budget_min} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Budget Max *
          </label>
          <input
            type="number"
            name="budget_max"
            value={form.budget_max}
            onChange={handleChange}
            className={inputClass("budget_max")}
            placeholder="e.g. 8000"
            min="1"
          />
          <FieldError message={fieldErrors.budget_max} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Deadline *</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="deadline_value"
              value={form.deadline_value}
              onChange={handleChange}
              className={`w-1/2 rounded-xl border px-4 py-3 outline-none ${fieldErrors.deadline_value
                ? "border-red-500 bg-red-50"
                : "focus:border-blue-500"
                }`}
              placeholder="2"
              min="1"
            />
            <select
              name="deadline_unit"
              value={form.deadline_unit}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
              <option value="weeks">weeks</option>
            </select>
          </div>
          <FieldError message={fieldErrors.deadline_value} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Estimated Duration *
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="estimated_duration_value"
              value={form.estimated_duration_value}
              onChange={handleChange}
              className={`w-1/2 rounded-xl border px-4 py-3 outline-none ${fieldErrors.estimated_duration_value
                ? "border-red-500 bg-red-50"
                : "focus:border-blue-500"
                }`}
              placeholder="4"
              min="1"
            />
            <select
              name="estimated_duration_unit"
              value={form.estimated_duration_unit}
              onChange={handleChange}
              className="w-1/2 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
          <FieldError message={fieldErrors.estimated_duration_value} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Skills Required
          </label>
          <input
            name="skills_required"
            value={form.skills_required}
            onChange={handleChange}
            className={inputClass("skills_required")}
            placeholder="e.g. lifting, packing, moving"
          />
          <div className="mt-1 flex justify-between text-sm">
            <FieldError message={fieldErrors.skills_required} />
            <span className="text-xs text-slate-500">
              Enter skills separated by commas. Max 10 skills.
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className={inputClass("notes")}
            placeholder="Optional notes..."
          />
          <div className="mt-1 flex justify-between text-sm">
            <FieldError message={fieldErrors.notes} />
            <span className="text-slate-400">{form.notes.length}/500</span>
          </div>
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
          {loading
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Job"}
        </button>
      </div>
    </form>
  );
}