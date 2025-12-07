"use client"

import { motion } from "motion/react"
import { FileText, Mail, Briefcase, ListChecks, Mic, Bot, CheckCircle2 } from "lucide-react"

export function ToolsSection() {
  const tools = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description:
        "Create ATS-optimized resumes that get past the robots and impress hiring managers. Whether you're a recent graduate or a seasoned professional, we'll help you put your best foot forward.",
      features: ["ATS-optimized templates", "AI-powered content suggestions", "Professional African templates"],
      color: "from-red-500 to-orange-500",
      bgColor: "from-red-50 to-orange-50",
    },
    {
      icon: Mail,
      title: "Smart Cover Letters & Emails",
      description:
        "First impressions matter. Our AI crafts personalized, compelling cover letters that align with the job description and showcase your personality. No more staring at a blank page—let us help you tell your story in a way that resonates with employers.",
      features: ["Job-specific customization", "Follow-up email templates", "Cultural awareness built-in"],
      color: "from-orange-500 to-yellow-500",
      bgColor: "from-orange-50 to-yellow-50",
    },
    {
      icon: Briefcase,
      title: "African & EMEA Job Board",
      description:
        "Our platform brings together thousands of curated listings from trusted companies, startups, NGOs, and international organizations. Whether you're a graduate, a remote worker looking, or a recruiter, KaziNest is designed to make every connection count.",
      features: [
        "Connecting Africa's Talent to the Right Jobs",
        "From entry-level to executive roles",
        "Job listings curated for Africa's dynamic market",
      ],
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50",
    },
    {
      icon: ListChecks,
      title: "Job Application Tracker",
      description:
        "Stay on top of every opportunity. The KaziNest Job Application Tracker helps you organize, monitor, and manage all your job applications in one place. Track statuses, deadlines, and responses effortlessly — so you always know where you stand and never miss a chance to follow up.",
      features: ["Application status tracking", "Success rate analytics", "Follow-up reminders"],
      color: "from-blue-500 to-teal-500",
      bgColor: "from-blue-50 to-teal-50",
    },
    {
      icon: Mic,
      title: "Mock AI Interview Prep",
      description:
        "Ace your next interview with confidence. Our Mock AI Interview Prep simulates real interview scenarios, gives instant feedback on your answers, and helps you refine your communication, tone, and confidence — all powered by smart AI insights.",
      features: [
        "AI-powered interview practice and feedback",
        "Practice with AI-generated questions",
        "Get detailed feedback",
      ],
      color: "from-yellow-500 to-amber-500",
      bgColor: "from-yellow-50 to-amber-50",
    },
    {
      icon: Bot,
      title: "AI Career Coach",
      description:
        "Your personal career mentor, available 24/7. The AI Career Coach offers tailored guidance on resumes, career paths, job search strategy, and skill growth — helping you make smarter moves toward your dream job.",
      features: [
        "Meet your all-in-one career growth companion",
        "Smart guidance with real-time practice",
        "Personalized career advice",
      ],
      color: "from-red-500 via-orange-500 to-yellow-500",
      bgColor: "from-red-50 to-yellow-50",
    },
  ]

  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">
            Land Your Dream Job With These AI-Powered Career Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop getting overlooked because of your location. KaziNest gives African professionals a fair advantage to
            compete globally and win jobs at top companies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${tool.bgColor} p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl mb-4 text-gray-900 font-bold">{tool.title}</h3>
                <p className="text-gray-600 mb-6">{tool.description}</p>
                <ul className="space-y-3">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
