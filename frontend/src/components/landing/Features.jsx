import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Bell,
  MessageCircle,
  Shield,
  Star,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: ArrowLeftRight,
    title: "Dual-Mode Platform",
    description:
      "Switch between worker and poster modes with a simple, flexible marketplace experience.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Fast Hiring Flow",
    description:
      "Post jobs, receive applications, and connect the right worker to the right task quickly.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Trusted Marketplace",
    description:
      "A structured workflow helps both posters and workers move through jobs with confidence.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Star,
    title: "Mutual Reviews",
    description:
      "Build credibility through two-way reviews so both sides can make better decisions.",
    gradient: "from-rose-500 to-orange-500",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    description:
      "Communicate directly once matched so expectations, updates, and delivery stay clear.",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    icon: Bell,
    title: "Live Notifications",
    description:
      "Stay updated with applications, selections, reviews, and important job activity instantly.",
    gradient: "from-yellow-500 to-green-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need in{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you want to work or hire, the platform gives you the key tools to do both.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}