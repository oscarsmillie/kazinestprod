"use client"

import { motion } from "motion/react"
import { FileCheck, Globe2, Users2, TrendingUp, Shield, Zap } from "lucide-react"

export function FeaturesGrid() {
  const features = [
    {
      icon: FileCheck,
      title: "ATS-Optimized",
      description: "Beat the automated screening systems with our intelligent resume optimization.",
    },
    {
      icon: Globe2,
      title: "Global Opportunities",
      description: "Access jobs from companies across Africa, EMEA, and the world.",
    },
    {
      icon: Users2,
      title: "Expert Guidance",
      description: "24/7 AI career coaching based on insights from industry experts.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your applications, interviews, and success rates in real-time.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is secure and never shared without your permission.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional resumes and cover letters in minutes, not hours.",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">
            Everything You Need to Dominate Your Job Search
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Proudly African. Globally competitive. Our AI understands your professional journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl mb-2 text-gray-900 font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
