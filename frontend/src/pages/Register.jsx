import { useState } from "react";
import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setToken, reload } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(email, password);
      setToken(data.access_token);
      await reload();
      navigate("/mode-select"); //me
    } catch (err) {
      setError(err?.response?.data?.detail || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Register</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Password (min 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          minLength={8}
          required
        />

        <button className="w-full border rounded-lg p-2 disabled:opacity-60" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <div className="text-sm">
          Already have an account? <Link className="underline" to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}