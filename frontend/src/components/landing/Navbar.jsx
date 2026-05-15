import { useState } from "react";
import { Link } from "react-router-dom";
import { Hammer, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
            <Hammer className="h-5 w-5 text-white" />
          </div>

          <span className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
            WorkHub
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            How it works
          </a>

          <a
            href="#testimonials"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Reviews
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How it works
            </a>

            <a
              href="#testimonials"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reviews
            </a>

            <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}