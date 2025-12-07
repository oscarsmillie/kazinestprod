"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Sparkles } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85) // 15% discount
  }

  const plans = [
    {
      key: "free",
      name: "Free Forever Plan",
      monthlyPrice: 0,
      color: "from-green-500 to-emerald-600",
      features: [
        "10 cover letters / month",
        "10 emails / month",
        "10 job applications tracking",
        "Ksh 199 per resume download",
        "Access to Public Job Board",
        "Save and Track Career Goals",
      ],
      limitations: ["Limited AI generations", "No premium templates", "No interview prep", "No priority support"],
      description: "Get started with essential tools for job applications.",
      ideal: "Ideal for beginners and casual job seekers testing the platform.",
    },
    {
      key: "professional",
      name: "Professional Plan",
      monthlyPrice: 599,
      color: "from-orange-500 to-red-600",
      popular: true,
      features: [
        "Unlimited cover letters",
        "Unlimited emails",
        "Unlimited job applications tracking",
        "10 free resume downloads per month",
        "All premium templates",
        "Premium job board access",
        "Unlimited interview prep sessions",
        "Unlimited AI career coaching",
        "Priority support",
        "ATS optimization tools",
        "Advanced analytics",
      ],
      limitations: [],
      description: "Everything you need for serious job hunting.",
      ideal: "Perfect for active job seekers and career professionals.",
      usdEquivalent: "$4.99",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your career goals
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 15%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? "ring-2 ring-orange-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${plan.color}`} />

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      Ksh{" "}
                      {billingInterval === "monthly"
                        ? plan.monthlyPrice.toLocaleString()
                        : getYearlyPrice(plan.monthlyPrice).toLocaleString()}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-gray-500">/{billingInterval === "monthly" ? "month" : "year"}</span>
                    )}
                  </div>
                  {plan.usdEquivalent && <p className="text-sm text-gray-500 mt-1">({plan.usdEquivalent}/month)</p>}
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400">{limitation}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 -mx-8 -mb-8 p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>{plan.ideal}</strong>
                  </p>
                  <Link
                    href={plan.key === "free" ? "/auth" : "/pricing"}
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {plan.key === "free" ? "Get Started Free" : "Upgrade Now"}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Questions? Check out our{" "}
            <Link href="/pricing" className="text-orange-600 hover:text-orange-700 font-medium">
              full pricing page
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
              contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
