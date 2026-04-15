import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  FileCheck,
  CheckCircle,
  PenTool,
  UserPlus,
  MessageSquare,
} from "lucide-react";

const workerSteps = [
  {
    icon: Search,
    title: "Browse & Apply",
    description:
      "Explore local jobs, choose the right fit, and submit your application in a few clicks.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: FileCheck,
    title: "Work & Collaborate",
    description:
      "Get selected, chat with the poster, complete the task, and keep everything organized.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: CheckCircle,
    title: "Complete & Grow",
    description:
      "Finish the job, confirm completion, and build your reputation with reviews.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
];

const posterSteps = [
  {
    icon: PenTool,
    title: "Post Your Job",
    description:
      "Create a job listing with the details workers need to understand your requirement clearly.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: UserPlus,
    title: "Review & Hire",
    description:
      "Check applications, compare workers, and select the best person for the task.",
    image:
      "https://images.unsplash.com/photo-1522202222206-b7507b7f1d4f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: MessageSquare,
    title: "Track & Close",
    description:
      "Chat, manage progress, confirm completion, and exchange reviews once the work is done.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HowItWorks() {
  const [activeMode, setActiveMode] = useState("worker");
  const steps = activeMode === "worker" ? workerSteps : posterSteps;

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 mb-8">
            Simple, transparent, and easy for both sides
          </p>

          <div className="inline-flex items-center gap-2 bg-white rounded-full p-2 shadow-lg">
            <button
              onClick={() => setActiveMode("worker")}
              className={`px-6 py-3 rounded-full transition-all ${
                activeMode === "worker"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              type="button"
            >
              For Workers
            </button>

            <button
              onClick={() => setActiveMode("poster")}
              className={`px-6 py-3 rounded-full transition-all ${
                activeMode === "poster"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              type="button"
            >
              For Employers
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div
                      className={`absolute top-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br ${
                        activeMode === "worker"
                          ? "from-indigo-500 to-purple-500"
                          : "from-purple-500 to-pink-500"
                      } flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="p-8">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${
                        activeMode === "worker"
                          ? "from-indigo-100 to-purple-100"
                          : "from-purple-100 to-pink-100"
                      } mb-4`}
                    >
                      <step.icon
                        className={`w-6 h-6 ${
                          activeMode === "worker"
                            ? "text-indigo-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>

                    <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      className="text-gray-300"
                    >
                      <path
                        d="M8 16H24M24 16L18 10M24 16L18 22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}