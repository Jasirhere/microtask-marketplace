import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section id="cta" className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 md:p-14 text-center shadow-xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Ready to Get Started?
        </h2>

        <p className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Join the platform today and start posting jobs or finding your next opportunity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-indigo-700 font-medium hover:bg-gray-100 transition"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}