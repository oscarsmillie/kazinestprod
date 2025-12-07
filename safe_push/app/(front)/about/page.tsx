"use client"

import { motion } from "motion/react"
import {
  Target,
  Users,
  Lightbulb,
  Award,
  FileText,
  Mail,
  Search,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Empowerment",
      description:
        "We believe in equipping you with the tools, insights, and confidence to take control of your career journey.",
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Career growth tools should be available to everyone, everywhere.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We leverage AI and technology to make job hunting smarter and more efficient.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We are committed to delivering quality tools that produce real results.",
    },
  ]

  const features = [
    {
      icon: FileText,
      title: "AI Resume & CV Builder",
      description:
        "Craft professional, tailored resumes in minutes. Our AI highlights your most relevant skills and achievements while optimizing for ATS compatibility.",
    },
    {
      icon: Mail,
      title: "Smart Cover Letter Creator",
      description:
        "Say goodbye to generic letters. Our AI crafts personalized, compelling cover letters that bring out your story and match the role.",
    },
    {
      icon: Search,
      title: "Job Board & Career Match",
      description:
        "Explore thousands of curated opportunities across Africa and the EMEA region. Our AI job matcher connects your skills to roles that truly fit.",
    },
    {
      icon: GraduationCap,
      title: "Skill Growth Hub",
      description:
        "Upskill with curated online courses designed to keep you competitive in the digital-first job market.",
    },
    {
      icon: CheckCircle2,
      title: "Expert Review",
      description:
        "Prefer a human touch? Our career experts refine your AI-generated documents for maximum impact and professionalism.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl opacity-20 animate-pulse"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">Where Ambition Finds Its Place</h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto">
              We&apos;re building more than just a job board or resume tool — we&apos;re creating a home for your career
              growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              At KaziNest, we&apos;re building more than just a job board or resume tool — we&apos;re creating a home
              for your career growth. In an evolving job market driven by technology, competition, and opportunity gaps,
              we exist to make sure every professional — from fresh graduates to seasoned experts — gets the visibility,
              confidence, and tools they deserve.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mt-6">
              Our mission is simple: to bridge the gap between African and EMEA talent and the opportunities that fit
              them best. Through AI-powered resume tools, smart job matching, and career development resources,
              we&apos;re redefining how people connect with work — faster, smarter, and more meaningfully.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our work is guided by a set of core principles that define who we are and how we serve you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl mb-2 text-gray-900 font-semibold">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Our Story</h2>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100">
              <p className="text-2xl text-gray-800 italic mb-8">
                &quot;Africa&apos;s greatest export isn&apos;t raw materials — it&apos;s talent. At KaziNest, we&apos;re
                unlocking that potential and connecting it to opportunities across the world.&quot;
              </p>
              <div className="text-center">
                <p className="text-gray-900 font-semibold">Oscar</p>
                <p className="text-orange-600">C.E.O</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              KaziNest was founded by Oscar, a digital innovator who experienced firsthand how traditional job hunting
              fails to capture true potential. Too many great talents were getting lost in outdated systems and
              cookie-cutter applications.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              So, we envisioned a smarter, fairer, and more empowering platform – one that blends AI precision with
              human understanding. Today, KaziNest stands as a career partner that helps users craft standout resumes,
              apply strategically, and connect to real opportunities across Africa and beyond.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We&apos;ve built tools that not only help you get noticed by recruiters but also reflect your authentic
              story and skills. Because at the heart of every great career is not just a job — it&apos;s the right fit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Do Best */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">What We Do Best</h2>
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
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all"
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

      {/* Join CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles size={20} className="text-yellow-100" />
              <span className="text-white">Join the KaziNest Movement</span>
            </div>

            <h2 className="text-4xl lg:text-5xl mb-6 text-white font-bold">Ready to Transform Your Career?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Thousands of professionals are already transforming their careers with KaziNest. Whether you&apos;re
              searching for your first role, changing industries, or leveling up your career, we&apos;re here to guide
              you every step of the way.
            </p>
            <p className="text-xl text-white/90 mb-8">
              Let&apos;s build a future where every talent finds its place — and every opportunity meets its match.
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
