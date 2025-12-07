"use client"

import { motion } from "motion/react"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      icon: Sparkles,
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with your job search",
      features: [
        "Basic Resume Builder",
        "ATS-optimized templates (3)",
        "Cover letter generator",
        "Job board access",
        "Basic job tracker",
        "Community support",
      ],
      cta: "Get Started Free",
      href: "/auth",
      popular: false,
      gradient: "from-gray-600 to-gray-700",
    },
    {
      name: "Pro",
      icon: Zap,
      price: "$19",
      period: "per month",
      description: "For serious job seekers ready to level up",
      features: [
        "Everything in Free",
        "Unlimited resume exports",
        "All premium templates",
        "AI Cover Letter personalization",
        "Advanced job matching",
        "Mock AI Interview Prep",
        "Job application analytics",
        "Priority support",
        "LinkedIn optimization",
      ],
      cta: "Start Pro Trial",
      href: "/auth",
      popular: true,
      gradient: "from-red-500 via-orange-500 to-yellow-500",
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Custom",
      period: "contact us",
      description: "For organizations and recruitment teams",
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Bulk resume processing",
        "Custom branding",
        "API access",
        "Dedicated account manager",
        "Advanced analytics & reporting",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      gradient: "from-teal-600 to-cyan-600",
    },
  ]

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "Yes, we offer a 14-day free trial for the Pro plan. No credit card required.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and mobile money (M-Pesa) for users in Kenya.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "You can cancel your subscription at any time. Your access will continue until the end of your billing period.",
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
            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">Choose Your Plan</h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto">
              Select the perfect plan for your career goals. All plans include our core features to help you land your
              dream job.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg ${
                    plan.popular ? "ring-2 ring-orange-500 shadow-2xl scale-105" : ""
                  } hover:shadow-xl transition-all`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="p-8">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <Icon className="text-white" size={24} />
                    </div>

                    <h3 className="text-2xl mb-2 text-gray-900 font-bold">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-5xl text-gray-900 font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-gray-600"> / {plan.period}</span>}
                      {plan.price === "Custom" && <span className="text-gray-600"> - {plan.period}</span>}
                    </div>

                    <Link
                      href={plan.href}
                      className={`block w-full px-6 py-3 rounded-lg mb-8 transition-all text-center font-semibold ${
                        plan.popular
                          ? "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:shadow-lg"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Got questions? We&apos;ve got answers.</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-xl mb-2 text-gray-900 font-semibold">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
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
            <h2 className="text-4xl lg:text-5xl mb-6 text-white font-bold">Still have questions?</h2>
            <p className="text-xl text-white/90 mb-8">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 font-semibold"
            >
              Contact Sales Team
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
