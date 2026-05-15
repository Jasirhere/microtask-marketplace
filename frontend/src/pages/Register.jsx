import { useState } from "react";
import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Hammer, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      navigate("/mode-select");
    } catch (err) {
      setError(err?.response?.data?.detail || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignUp = () => {
    alert("Google Sign Up will be added next");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[-80px] top-20 h-64 w-64 rounded-full bg-indigo-200 opacity-60 blur-3xl sm:left-10 sm:h-72 sm:w-72"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-20 right-[-80px] h-64 w-64 rounded-full bg-purple-200 opacity-60 blur-3xl sm:right-10 sm:h-72 sm:w-72"
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center sm:min-h-[calc(100vh-5rem)]">
        <button
          onClick={() => navigate("/")}
          className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 sm:mb-8"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/85 p-5 shadow-2xl backdrop-blur-sm sm:p-8 md:p-10"
        >
          <div className="mb-7 flex items-center justify-center gap-2 sm:mb-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 sm:h-12 sm:w-12">
              <Hammer className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>

            <span className="break-words text-2xl font-semibold text-slate-900 sm:text-3xl">
              WorkHub
            </span>
          </div>

          <div className="mb-7 text-center sm:mb-8">
            <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
              Create Account
            </h1>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600 sm:text-base">
              Create your account to get started
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 sm:px-6 sm:py-3.5"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            <span className="min-w-0 break-words">Continue with Google</span>
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">
                Or sign up with email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border-2 border-slate-300 py-3.5 pl-12 pr-4 text-sm outline-none transition-colors focus:border-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full rounded-xl border-2 border-slate-300 py-3.5 pl-12 pr-12 text-sm outline-none transition-colors focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                required
              />

              <span className="break-words text-sm leading-6 text-slate-600">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 break-words text-center text-sm text-slate-600 sm:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </motion.section>
      </main>
    </div>
  );
}