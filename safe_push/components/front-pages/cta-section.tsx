"use client"

import { motion } from "motion/react"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles size={20} className="text-yellow-100" />
            <span className="text-white">Ready to take the next step in your career?</span>
          </div>

          <h2 className="text-4xl lg:text-6xl mb-6 text-white font-bold">Your dream job is one click away</h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            KaziNest was built to connect the best of Africa and the EMEA region to meaningful opportunities across the
            world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group font-semibold"
            >
              Sign Up Free Today
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Learn More About Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
