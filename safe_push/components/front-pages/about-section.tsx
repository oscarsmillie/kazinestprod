"use client"

import { motion } from "motion/react"
import { BarChart3, Heart } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-red-500" size={24} />
              <span className="text-red-600 font-medium">Who We Are</span>
            </div>
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">
              Join 15,000+ Successful KaziNest Professionals.
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              At KaziNest, we believe landing your dream job shouldn&apos;t feel like a game of chance. Traditional
              means of job application often fail to highlight what makes you the perfect fit.
            </p>
            <p className="text-xl text-gray-600">
              And we&apos;re here to redefine the job search—one smart application at a time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="/diverse-african-professionals-collaborating-in-mod.jpg"
              alt="Team collaboration"
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <img
              src="/professional-african-person-celebrating-career-suc.jpg"
              alt="Career success"
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-orange-500" size={24} />
              <span className="text-orange-600 font-medium">What We Do</span>
            </div>
            <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">
              Smart tools. Real Results. Career Growth Made Simple.
            </h2>
            <p className="text-xl text-gray-600">
              KaziNest is on a mission to bridge the gap between talent and opportunity. By combining cutting-edge AI
              with insights from career experts, we empower jobseekers to create personalized, impactful applications.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
