import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <Link to="/" className="flex w-fit items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <Hammer className="h-5 w-5 text-white" />
              </div>

              <span className="truncate text-xl font-bold">WorkHub</span>
            </Link>

            <p className="mt-4 max-w-sm break-words text-sm leading-6 text-slate-400">
              A simple local micro-task marketplace for posters and workers to
              manage jobs, applications, chat, reviews, and completion flow.
            </p>
          </div>

          <FooterColumn
            title="Platform"
            links={[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Reviews", href: "#testimonials" },
            ]}
          />

          <FooterColumn
            title="Account"
            links={[
              { label: "Sign in", to: "/login" },
              { label: "Register", to: "/register" },
            ]}
          />

          <FooterColumn
            title="Modes"
            links={[
              { label: "Post jobs", to: "/register" },
              { label: "Find work", to: "/register" },
            ]}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words">
            © {new Date().getFullYear()} WorkHub. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#" className="hover:text-white">
              Privacy
            </a>

            <a href="#" className="hover:text-white">
              Terms
            </a>

            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 break-words text-sm font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </h3>

      <div className="space-y-2">
        {links.map((link) =>
          link.to ? (
            <Link
              key={link.label}
              to={link.to}
              className="block break-words text-sm text-slate-400 hover:text-white"
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className="block break-words text-sm text-slate-400 hover:text-white"
            >
              {link.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}