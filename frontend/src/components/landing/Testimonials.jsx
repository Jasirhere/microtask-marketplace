import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Graphic Designer",
    rating: 5,
    text: "I have completed many jobs through this platform. The flow is simple, the reviews build trust, and I always know where I stand.",
    avatar: "SJ",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Michael Chen",
    role: "Small Business Owner",
    rating: 5,
    text: "Posting a job and getting quality responses was surprisingly quick. The platform makes hiring feel smooth and structured.",
    avatar: "MC",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Emily Rodriguez",
    role: "Web Developer",
    rating: 5,
    text: "One of the cleanest marketplace experiences I have used. I like the direct chat, the clear steps, and the mutual reviews.",
    avatar: "ER",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "David Kim",
    role: "Marketing Manager",
    rating: 5,
    text: "The worker quality has been great, and the ability to manage the workflow from one place saves a lot of time.",
    avatar: "DK",
    color: "from-rose-500 to-orange-500",
  },
  {
    name: "Lisa Thompson",
    role: "Content Writer",
    rating: 5,
    text: "I can find work, build my reviews, and keep everything organized. It feels modern and easy to use.",
    avatar: "LT",
    color: "from-orange-500 to-yellow-500",
  },
  {
    name: "James Wilson",
    role: "Startup Founder",
    rating: 5,
    text: "A strong marketplace experience with good structure, clear communication, and a simple hiring journey.",
    avatar: "JW",
    color: "from-yellow-500 to-green-500",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Workers & Employers
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join people who already trust the platform for getting work done and finding opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-200" />

              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-xl font-semibold mb-4`}
              >
                {testimonial.avatar}
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>

              <div>
                <div className="font-semibold text-slate-900">{testimonial.name}</div>
                <div className="text-gray-600">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}