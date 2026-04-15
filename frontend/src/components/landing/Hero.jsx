import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Hammer } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [mode, setMode] = useState("worker");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 mb-8 shadow-lg"
        >
          <button
            onClick={() => setMode("worker")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              mode === "worker"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            type="button"
          >
            <Hammer className="w-5 h-5" />
            <span>I&apos;m a Worker</span>
          </button>

          <button
            onClick={() => setMode("poster")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              mode === "poster"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            type="button"
          >
            <Briefcase className="w-5 h-5" />
            <span>I&apos;m Hiring</span>
          </button>
        </motion.div>

        <motion.h1
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          {mode === "worker" ? (
            <>
              Find Your Next <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Great Opportunity
              </span>
            </>
          ) : (
            <>
              Hire Talented <br />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Professionals Fast
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          key={`${mode}-desc`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          {mode === "worker"
            ? "Browse jobs, apply quickly, complete work, and grow your profile with trusted reviews."
            : "Post local jobs in minutes, review applicants, hire confidently, and manage work smoothly."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/register"
            className={`group flex items-center gap-2 px-8 py-4 rounded-full text-white shadow-lg hover:shadow-xl transition-all ${
              mode === "worker"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {mode === "worker" ? "Find Work" : "Post a Job"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-all bg-white/50 backdrop-blur-sm"
          >
            Learn More
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20"
        >
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">200K+</div>
            <div className="text-gray-600">Workers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}