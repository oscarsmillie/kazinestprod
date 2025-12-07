"use client"

import { motion } from "motion/react"
import { FileText, Sparkles, Download, Zap, Target } from "lucide-react"
import Link from "next/link"

export default function ResumeBuilderPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Content",
      description:
        "Our AI analyzes your experience and suggests compelling bullet points that highlight your achievements.",
    },
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Get past Applicant Tracking Systems with formats and keywords that recruiters actually see.",
    },
    {
      icon: Download,
      title: "Multiple Formats",
      description: "Export your resume in PDF, Word, or plain text format - whatever the job requires.",
    },
  ]

  const templates = [
    { name: "Modern Professional", color: "from-blue-500 to-cyan-500" },
    { name: "Creative Bold", color: "from-red-500 to-orange-500" },
    { name: "Executive Classic", color: "from-gray-600 to-gray-800" },
    { name: "Tech Minimalist", color: "from-teal-500 to-green-500" },
    { name: "Academic Traditional", color: "from-purple-500 to-pink-500" },
    { name: "Startup Dynamic", color: "from-yellow-500 to-orange-500" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <FileText size={20} className="text-white" />
              <span className="text-white">AI Resume Builder</span>
            </div>

            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">
              Create Resumes That Get You{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Noticed</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Build professional, ATS-optimized resumes in minutes with our AI-powered platform. Tailored for African
              professionals competing globally.
            </p>

            <Link
              href="/auth"
              className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 font-semibold"
            >
              Start Building Your Resume
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Powerful Features for Your Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create a standout resume that gets you interviews
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl mb-3 text-gray-900 font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Professional Templates</h2>
            <p className="text-xl text-gray-600">
              Choose from our collection of ATS-optimized templates designed for African professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`h-64 bg-gradient-to-br ${template.color} p-6 flex items-center justify-center`}>
                  <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/30 flex items-center justify-center">
                    <FileText className="text-white" size={64} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-gray-900 text-center font-semibold">{template.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="mx-auto mb-6 text-yellow-200" size={48} />
            <h2 className="text-4xl lg:text-5xl mb-6 text-white font-bold">Ready to Build Your Perfect Resume?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of African professionals who have landed their dream jobs with KaziNest
            </p>
            <Link
              href="/auth"
              className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 font-semibold"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
