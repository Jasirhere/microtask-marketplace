import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Poster",
    text: "I posted a moving task and found a reliable worker quickly. The chat and completion flow made the process easy to manage.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Worker",
    text: "The platform helped me find local jobs that matched my skills. Having reviews on my profile makes it easier to win more work.",
    rating: 5,
  },
  {
    name: "Aisha Khan",
    role: "Poster",
    text: "I liked being able to review applicants before selecting someone. It felt more controlled than just posting randomly elsewhere.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Reviews
          </p>

          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Built for trust between posters and workers
          </h2>

          <p className="mt-4 break-words text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
            Profiles, applications, chat, completion confirmation, and reviews
            help both sides work with better confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex flex-wrap gap-1">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-amber-500 text-amber-500"
                  />
                ))}
              </div>

              <p className="flex-1 break-words text-sm leading-7 text-slate-600 sm:text-base">
                “{item.text}”
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="break-words font-semibold text-slate-950">
                  {item.name}
                </p>

                <p className="mt-1 break-words text-sm text-slate-500">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}