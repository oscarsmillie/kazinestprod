"use client"

import { motion } from "motion/react"
import { Briefcase, Heart, Zap, Users, MapPin, DollarSign } from "lucide-react"

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Nairobi, Kenya (Hybrid)",
      type: "Full-time",
      salary: "$60k - $90k",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$50k - $75k",
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Nairobi, Kenya",
      type: "Full-time",
      salary: "$40k - $60k",
    },
    {
      title: "Content Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Contract",
      salary: "$35k - $50k",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Impact-Driven",
      description: "We're building tools that genuinely help people transform their careers and lives.",
    },
    {
      icon: Zap,
      title: "Innovation First",
      description: "We embrace new technologies and approaches to solve real problems.",
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "We believe the best solutions come from diverse perspectives working together.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Briefcase className="mx-auto mb-6 text-white" size={64} />
            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">Join Our Mission</h1>

            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Help us empower African professionals to compete globally and achieve their career dreams
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl mb-3 text-gray-900 font-semibold">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Why Work With Us</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Competitive salary & equity",
              "Health insurance",
              "Flexible working hours",
              "Remote-first culture",
              "Learning & development budget",
              "Annual team retreats",
              "Latest tech & tools",
              "Collaborative environment",
              "Career growth opportunities",
            ].map((perk, index) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Open Positions</h2>
            <p className="text-xl text-gray-600">Find your next career opportunity</p>
          </motion.div>

          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl text-gray-900 mb-2 font-bold">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase size={16} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-white font-bold">Don&apos;t See a Perfect Fit?</h2>
            <p className="text-xl text-white/90 mb-8">
              We&apos;re always looking for talented individuals. Send us your resume and let&apos;s talk!
            </p>
            <button className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 font-semibold">
              Send Us Your Resume
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
