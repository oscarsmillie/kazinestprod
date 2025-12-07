"use client"

import { motion } from "motion/react"
import { Target, Users, Clock } from "lucide-react"

export function ValuePropositions() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl mb-4 text-gray-900 font-bold">
            No More Limits. Africa&apos;s Talent Deserves the World.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            KaziNest is built for corporates, professionals, and freelancers chasing growth. Whether you&apos;re seeking
            your first job or your next big break, we&apos;re here to make sure you&apos;re seen, valued, and hired.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border border-red-100 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="text-3xl mb-2 text-gray-900 font-bold">49 Days</h3>
            <p className="text-gray-900 mb-2 font-semibold">Get Hired Fast</p>
            <p className="text-gray-600">
              That&apos;s the average it takes for serious KaziNest users to start getting interviews.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-100 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-3xl mb-2 text-gray-900 font-bold">Build Elite Networks</h3>
            <p className="text-gray-900 mb-2 font-semibold">Collaborate</p>
            <p className="text-gray-600">
              Success isn&apos;t just about applying to different jobs—it&apos;s about who you connect with.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl border border-yellow-100 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="text-3xl mb-2 text-gray-900 font-bold">Dominate Your Job Search</h3>
            <p className="text-gray-900 mb-2 font-semibold">Everything You Need</p>
            <p className="text-gray-600">
              Proudly African. Globally competitive. Our AI understands your professional journey.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
