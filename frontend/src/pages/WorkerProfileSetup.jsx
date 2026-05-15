import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkerProfile } from "../api/profile";
import { useAuth } from "../auth/AuthContext";
import LocationDropdowns from "../components/LocationDropdowns";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";
import { WORKER_SKILL_OPTIONS } from "../data/skills";

export default function WorkerProfileSetup() {
  const navigate = useNavigate();
  const { reload } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    photo_data_url: "",
    bio: "",
    location: "",
    skills: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const allSkills = WORKER_SKILL_OPTIONS.flatMap((group) => group.skills);

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Full name must be at least 2 characters";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required";
    }

    if (!Array.isArray(form.skills) || form.skills.length === 0) {
      nextErrors.skills = "Select at least one skill";
    }

    if (form.skills.length > 8) {
      nextErrors.skills = "Select up to 8 skills";
    }

    if (form.bio.trim() && form.bio.trim().length < 20) {
      nextErrors.bio = "Bio must be at least 20 characters";
    } else if (form.bio.trim().length > 500) {
      nextErrors.bio = "Bio cannot exceed 500 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  }

  function handleLocationChange(location) {
    setForm((prev) => ({
      ...prev,
      location,
    }));

    setErrors((prev) => ({
      ...prev,
      location: "",
    }));

    setServerError("");
  }

  function toggleSkill(skill) {
    setForm((prev) => {
      const exists = prev.skills.includes(skill);

      if (exists) {
        return {
          ...prev,
          skills: prev.skills.filter((item) => item !== skill),
        };
      }

      if (prev.skills.length >= 8) {
        return prev;
      }

      return {
        ...prev,
        skills: [...prev.skills, skill],
      };
    });

    setErrors((prev) => ({
      ...prev,
      skills: "",
    }));

    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        photo_data_url: form.photo_data_url,
        bio: form.bio.trim(),
        location: form.location.trim(),
        skills: form.skills,
      };

      await createWorkerProfile(payload);
      await reload();
      navigate("/worker/jobs", { replace: true });
    } catch (err) {
      setServerError(
        err?.response?.data?.detail || "Failed to create worker profile"
      );
    } finally {
      setLoading(false);
    }
  }

  function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-red-600">{message}</p>;
  }

  function inputClass(fieldName) {
    return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
      errors[fieldName] ? "border-red-500 bg-red-50" : "border-slate-300"
    }`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto w-full max-w-4xl">
        <header className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 sm:h-16 sm:w-16">
            <span className="text-xl text-white">🛠️</span>
          </div>

          <h1 className="break-words text-2xl font-semibold text-slate-950 sm:text-3xl">
            Complete Your Worker Profile
          </h1>

          <p className="mt-2 break-words text-sm leading-6 text-slate-600 sm:text-base">
            Add your details so posters can trust you before assigning work.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            {serverError && (
              <div className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <section>
              <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 sm:text-xl">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ProfilePhotoUpload
                    id="worker-profile-photo"
                    value={form.photo_data_url}
                    onChange={(photoDataUrl) =>
                      setForm((prev) => ({
                        ...prev,
                        photo_data_url: photoDataUrl,
                      }))
                    }
                    label="Profile photo"
                    error={errors.photo_data_url}
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Full name *
                  </label>

                  <input
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass("name")}
                  />

                  <FieldError message={errors.name} />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Phone number *
                  </label>

                  <input
                    name="phone"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass("phone")}
                  />

                  <FieldError message={errors.phone} />
                </div>

                <div className="min-w-0 md:col-span-2">
                  <LocationDropdowns
                    value={form.location}
                    onChange={handleLocationChange}
                    error={errors.location}
                    required
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 sm:text-xl">
                Skills
              </h2>

              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Select your skills *
                </p>

                <p className="text-xs text-slate-500">
                  {form.skills.length}/8 selected
                </p>
              </div>

              {form.skills.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex max-w-full items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      <span className="min-w-0 break-words">{skill}</span>

                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="shrink-0 rounded-full text-indigo-500 hover:text-indigo-800"
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`rounded-xl border p-3 ${
                  errors.skills
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white"
                }`}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {allSkills.map((skill) => {
                    const selected = form.skills.includes(skill);
                    const disabled = !selected && form.skills.length >= 8;

                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        disabled={disabled}
                        className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                          selected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : disabled
                            ? "border-slate-200 bg-slate-100 text-slate-400"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        <span className="block break-words">{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <FieldError message={errors.skills} />
            </section>

            <section>
              <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 sm:text-xl">
                About You
              </h2>

              <textarea
                name="bio"
                placeholder="Tell posters about your experience, reliability, and the type of jobs you can do."
                value={form.bio}
                onChange={handleChange}
                className={`${inputClass("bio")} resize-y`}
                rows={4}
              />

              <div className="mt-1 flex items-start justify-between gap-3 text-sm">
                <FieldError message={errors.bio} />

                <span className="shrink-0 text-slate-400">
                  {form.bio.length}/500
                </span>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/select-mode")}
                className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-1"
              >
                Go Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 sm:flex-1"
              >
                {loading ? "Saving..." : "Save Worker Profile"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}