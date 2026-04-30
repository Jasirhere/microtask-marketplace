import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPosterProfile } from "../api/profile";
import { useAuth } from "../auth/AuthContext";

export default function PosterProfileSetup() {
  const navigate = useNavigate();
  const { reload } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    photo_data_url: "",
    bio: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        photo_data_url: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createPosterProfile(form);
      await reload();
      navigate("/poster", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create poster profile");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl">👤</span>
        </div>
        <h1 className="text-3xl font-semibold">Complete Your Poster Profile</h1>
        <p className="text-gray-600">Let workers know who they are working with</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="text-red-600 text-sm">{error}</div>}

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
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-lg border p-2"
              />
            </div>

            {form.photo_data_url && (
              <img
                src={form.photo_data_url}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover border mb-4"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 md:col-span-2"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              About You
            </h2>

            <textarea
              name="bio"
              placeholder="Short bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              rows={4}
            />
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
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Poster Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}