"use client"

import { motion } from "motion/react"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Brandon M.",
      role: "CEO, Tech Innovators",
      content:
        "Before discovering KaziNest, I'd spent months sending applications that never got a single response. Within three weeks, I got interviews with three international companies and landed a $180k remote job with a U.S. tech firm. KaziNest is a bridge to real, life-changing opportunities.",
      rating: 5,
    },
    {
      name: "Fatima K.",
      role: "Founder, Creative Solutions",
      content:
        "What I love most about KaziNest is how personal it feels. The AI career coach guided me through rewriting my professional summary, suggested roles I was actually qualified for, and even helped me prepare for interviews. I've now joined a top marketing agency in Dubai.",
      rating: 5,
    },
  ]

  return (
    <section
      id="testimonials"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-amber-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">Success Stories from East Africa</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re proud to help job seekers across East Africa unlock their career potential. Here&apos;s what some
            of our users from Kenya and beyond have to say about their experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <Quote className="absolute top-6 right-6 text-orange-100" size={48} />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>

              <p className="text-gray-700 mb-6 relative z-10">{testimonial.content}</p>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <h3 className="text-3xl mb-4 text-gray-900 font-bold">Stop Getting Rejected. Start Getting Hired.</h3>
          <p className="text-xl text-gray-600 mb-8">Bridging Talent and Opportunity with Precision and Purpose</p>
        </motion.div>
      </div>
    </section>
  )
}
