import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkerProfile } from "../api/profile";
import { useAuth } from "../auth/AuthContext";
import LocationDropdowns from "../components/LocationDropdowns";
export default function WorkerProfileSetup() {
  const navigate = useNavigate();
  const { reload } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    photo_data_url: "",
    location: "",
    bio: "",
    skills: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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
    } else if (form.location.trim().length < 2) {
      nextErrors.location = "Location is too short";
    }

    if (!form.skills.trim()) {
      nextErrors.skills = "Add at least one skill";
    } else {
      const skillList = form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      if (skillList.length === 0) {
        nextErrors.skills = "Add at least one valid skill";
      }
    }

    if (!form.bio.trim()) {
      nextErrors.bio = "Short bio is required";
    } else if (form.bio.trim().length < 20) {
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

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo_data_url: "Only JPG, PNG, or WEBP images are allowed",
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        photo_data_url: "Image size must be under 2MB",
      }));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        photo_data_url: reader.result,
      }));

      setErrors((prev) => ({
        ...prev,
        photo_data_url: "",
      }));
    };

    reader.readAsDataURL(file);
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
        location: form.location.trim(),
        bio: form.bio.trim(),
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">👤</span>
          </div>
          <h1 className="text-3xl font-semibold">Complete Your Worker Profile</h1>
          <p className="text-gray-600">Let employers know about your skills</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Personal Information
              </h2>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Profile Photo
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full border p-2 rounded-lg"
                />

                <FieldError message={errors.photo_data_url} />

                {form.photo_data_url && (
                  <img
                    src={form.photo_data_url}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full mt-3 object-cover border"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    name="name"
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  <FieldError message={errors.name} />
                </div>

                <div>
                  <input
                    name="phone"
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  <FieldError message={errors.phone} />
                </div>

                <div className="md:col-span-2">
                  <LocationDropdowns
                    value={form.location}
                    onChange={handleLocationChange}
                    error={errors.location}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Professional Information
              </h2>

              <div className="mb-4">
                <input
                  name="skills"
                  placeholder="Skills * (comma separated)"
                  value={form.skills}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl ${
                    errors.skills ? "border-red-500" : ""
                  }`}
                />
                <FieldError message={errors.skills} />
              </div>

              <div>
                <textarea
                  name="bio"
                  placeholder="Short Bio *"
                  value={form.bio}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl ${
                    errors.bio ? "border-red-500" : ""
                  }`}
                  rows={4}
                />
                <div className="mt-1 flex justify-between text-sm">
                  <FieldError message={errors.bio} />
                  <span className="text-gray-400">
                    {form.bio.length}/500
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/select-mode")}
                className="flex-1 py-3 border rounded-xl"
              >
                Go Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? "Saving..." : "Create Worker Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}