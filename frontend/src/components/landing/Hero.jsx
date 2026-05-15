import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Hammer } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [mode, setMode] = useState("worker");

  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[-90px] top-20 h-64 w-64 rounded-full bg-indigo-200 opacity-60 blur-3xl sm:left-10 sm:h-72 sm:w-72"
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-20 right-[-90px] h-64 w-64 rounded-full bg-purple-200 opacity-60 blur-3xl sm:right-10 sm:h-72 sm:w-72"
          animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-7 inline-flex max-w-full flex-col gap-2 rounded-2xl bg-white/85 p-2 shadow-lg backdrop-blur-sm sm:mb-8 sm:flex-row sm:rounded-full"
        >
          <button
            onClick={() => setMode("worker")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all sm:w-auto sm:rounded-full sm:px-6 ${
              mode === "worker"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            type="button"
          >
            <Hammer className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">I&apos;m a Worker</span>
          </button>

          <button
            onClick={() => setMode("poster")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all sm:w-auto sm:rounded-full sm:px-6 ${
              mode === "poster"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            type="button"
          >
            <Briefcase className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">I&apos;m Hiring</span>
          </button>
        </motion.div>

        <motion.h1
          key={mode}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl break-words text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {mode === "worker" ? (
            <>
              Find Your Next{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Great Opportunity
              </span>
            </>
          ) : (
            <>
              Hire Talented{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Professionals Fast
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          key={`${mode}-desc`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl break-words text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg md:text-xl"
        >
          {mode === "worker"
            ? "Browse jobs, apply quickly, complete work, and grow your profile with trusted reviews."
            : "Post local jobs in minutes, review applicants, hire confidently, and manage work smoothly."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <Link
            to="/register"
            className={`group flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl sm:w-auto sm:px-8 sm:py-4 sm:text-base ${
              mode === "worker"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <span>{mode === "worker" ? "Find Work" : "Post a Job"}</span>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full rounded-full border-2 border-slate-300 bg-white/60 px-7 py-3.5 text-center text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all hover:border-slate-400 hover:bg-white sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Learn More
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:mt-20"
        >
          <Stat value="50K+" label="Active Jobs" />
          <Stat value="200K+" label="Workers" />
          <Stat value="4.9/5" label="Average Rating" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-5 shadow-sm backdrop-blur-sm">
      <div className="break-words text-3xl font-bold text-slate-950 sm:text-4xl">
        {value}
      </div>

      <div className="mt-1 break-words text-sm text-slate-600 sm:text-base">
        {label}
      </div>
    </div>
  );
}