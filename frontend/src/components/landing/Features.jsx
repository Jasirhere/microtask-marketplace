import {
  BadgeCheck,
  Briefcase,
  Clock,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Post and find jobs easily",
    description:
      "Create job posts, browse available work, apply quickly, and manage everything from one simple dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Built-in chat",
    description:
      "Once a worker is selected, both sides can message each other directly about the job.",
  },
  {
    icon: ShieldCheck,
    title: "Profile-based trust",
    description:
      "Workers and posters can build profiles with photos, skills, reviews, and completed job history.",
  },
  {
    icon: Clock,
    title: "Track work progress",
    description:
      "Follow job status from open to assigned, completed, reviewed, and paid.",
  },
  {
    icon: Star,
    title: "Reviews and ratings",
    description:
      "Both sides can leave reviews after completion, helping future users make better choices.",
  },
  {
    icon: BadgeCheck,
    title: "Cleaner workflow",
    description:
      "Keep applications, job details, completion confirmation, reviews, and payment flow organised.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Features
          </p>

          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Everything needed to manage small jobs properly
          </h2>

          <p className="mt-4 break-words text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
            The platform is designed around a simple flow: post work, apply,
            select, chat, complete, review, and pay.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="break-words text-lg font-bold text-slate-950 sm:text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 break-words text-sm leading-7 text-slate-600 sm:text-base">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}