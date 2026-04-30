import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkerProfile } from "../api/profile";
import { useAuth } from "../auth/AuthContext";
import { User, Phone, MapPin, Briefcase, FileText } from "lucide-react";

export default function WorkerProfileSetup() {
  const navigate = useNavigate();
  const { reload } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    photo_data_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await createWorkerProfile({
        name: form.name,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
        photo_data_url: form.photo_data_url,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      await reload();
      navigate("/worker/jobs");
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

 return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl">👤</span>
        </div>
        <h1 className="text-3xl font-semibold">Complete Your Worker Profile</h1>
        <p className="text-gray-600">Let employers know about your skills</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h2>

            {/* Photo Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded-lg"
              />
              {form.photo_data_url && (
                <img
                  src={form.photo_data_url}
                  className="h-20 w-20 rounded-full mt-2 object-cover border"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <input
                name="name"
                placeholder="Full Name *"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
                required
              />

              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />

              <input
                name="location"
                placeholder="Location *"
                value={form.location}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl md:col-span-2"
                required
              />
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Professional Information</h2>

            <input
              name="skills"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl mb-4"
            />

            <textarea
              name="bio"
              placeholder="Short Bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
              rows={4}
            />
          </div>

          {/* Buttons */}
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
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
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