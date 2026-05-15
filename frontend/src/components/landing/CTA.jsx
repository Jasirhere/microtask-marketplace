import { ArrowRight, Briefcase, Hammer } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 px-4 py-14 text-white sm:px-6 sm:py-18 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-5xl text-center">
        <h2 className="break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Ready to get started?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
          Create an account, choose your mode, and start using the platform as a
          poster or worker.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mx-auto sm:max-w-xl sm:grid-cols-2">
          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-slate-100 sm:text-base"
          >
            <Hammer className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">Find Work</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>

          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:text-base"
          >
            <Briefcase className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">Post a Job</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}