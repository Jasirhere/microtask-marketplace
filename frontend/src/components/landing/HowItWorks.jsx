import { CheckCircle2, ClipboardList, MessageSquare, Star } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Post or find a job",
    description:
      "Posters create jobs with budget, location, deadline, and skills. Workers browse jobs and apply.",
  },
  {
    icon: CheckCircle2,
    title: "Select the right person",
    description:
      "Posters review applications, check worker profiles, and select the best fit.",
  },
  {
    icon: MessageSquare,
    title: "Chat and complete the work",
    description:
      "Once selected, both sides can chat, manage the task, and confirm completion.",
  },
  {
    icon: Star,
    title: "Review and close",
    description:
      "After completion, both sides can leave reviews and the poster can release payment.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
            How it works
          </p>

          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            A simple flow from job post to completion
          </h2>

          <p className="mt-4 break-words text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
            The workflow is intentionally direct, so users are not lost between
            posting, applying, chatting, completing, reviewing, and payment.
          </p>
        </div>

        <div className="relative mt-10 sm:mt-14">
          <div className="hidden lg:absolute lg:left-0 lg:right-0 lg:top-14 lg:block lg:h-px lg:bg-slate-300" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="relative min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="break-words text-lg font-bold text-slate-950 sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 break-words text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}