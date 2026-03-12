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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white border rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Create Poster Profile</h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium">Profile Photo</label>
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
            className="h-20 w-20 rounded-full object-cover border"
          />
        )}

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
          className="w-full border rounded-lg p-3"
        />

        <textarea
          name="bio"
          placeholder="Short bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          rows={4}
        />

        <button
          disabled={loading}
          className="w-full rounded-lg p-3 border bg-slate-900 text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Poster Profile"}
        </button>
      </form>
    </div>
  );
}