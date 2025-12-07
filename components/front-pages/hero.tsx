"use client"

import { motion } from "motion/react"
import { CheckCircle2, Sparkles, TrendingUp, Users, Briefcase, Award } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const features = [
    "CVs",
    "Cover Letters & Emails",
    "EMEA Job Board",
    "AI Interview Prep",
    "Job Tracker",
    "AI Career Coach",
  ]

  const stats = [
    { icon: Users, value: "15,000+", label: "Active Users" },
    {
      icon: Briefcase,
      value: "49 Days",
      label: "Avg. to Interview",
    },
    { icon: Award, value: "94%", label: "Success Rate" },
  ]

  return (
    <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hero Banner Background */}
      <div className="absolute inset-0">
        <img
          src="Hero.png"
          alt="KaziNest Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Centralized content */}
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="text-white">Africa&apos;s Career Cheat Code</span>
            </div>

            <h1 className="text-5xl lg:text-7xl mb-6 text-white mx-auto max-w-4xl font-bold">
              One Dashboard to Rule{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                Every Application
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Land your dream job with AI-powered tools built for African professionals competing globally
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <Link
                href="/auth"
                className="px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Building Your Career CV</span>
                <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                Watch Demo
              </button>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3 mb-16 justify-center"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.1,
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + index * 0.1,
                }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
              >
                <Icon className="text-yellow-400 mb-3" size={32} />
                <div className="text-3xl text-white mb-1 font-bold">{stat.value}</div>
                <div className="text-gray-200">{stat.label}</div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
