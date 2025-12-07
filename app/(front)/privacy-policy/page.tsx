"use client"

import { motion } from "motion/react"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Shield className="mx-auto mb-6 text-white" size={64} />
            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">Privacy Policy</h1>

            <p className="text-xl text-white/90">Last updated: December 7, 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-blue-50 p-6 rounded-xl mb-12">
              <p className="text-gray-700 mb-0">
                At KaziNest, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our platform.
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="text-white" size={20} />
                  </div>
                  <h2 className="text-3xl text-gray-900 mb-0 font-bold">Information We Collect</h2>
                </div>
                <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Personal information (name, email address, phone number)</li>
                  <li>Professional information (resume, work history, education)</li>
                  <li>Account credentials and preferences</li>
                  <li>Communications with us and other users</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Eye className="text-white" size={20} />
                  </div>
                  <h2 className="text-3xl text-gray-900 mb-0 font-bold">How We Use Your Information</h2>
                </div>
                <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Create and manage your account</li>
                  <li>Generate AI-powered resumes and cover letters</li>
                  <li>Match you with relevant job opportunities</li>
                  <li>Send you updates, newsletters, and promotional materials</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve user experience</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Lock className="text-white" size={20} />
                  </div>
                  <h2 className="text-3xl text-gray-900 mb-0 font-bold">Data Security</h2>
                </div>
                <p className="text-gray-600">
                  We implement appropriate technical and organizational security measures to protect your personal
                  information. However, no method of transmission over the internet or electronic storage is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Information Sharing</h2>
                <p className="text-gray-600 mb-4">We may share your information with:</p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>
                    <strong>Employers:</strong> When you apply to jobs through our platform
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who assist in operating our platform
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Your Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Cookies and Tracking</h2>
                <p className="text-gray-600">
                  We use cookies and similar tracking technologies to track activity on our platform and store certain
                  information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                  sent.
                </p>
              </div>

              <div>
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Children&apos;s Privacy</h2>
                <p className="text-gray-600">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect
                  personal information from children under 18.
                </p>
              </div>

              <div>
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Changes to This Policy</h2>
                <p className="text-gray-600">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
                <h2 className="text-3xl text-gray-900 mb-4 font-bold">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>
                    <strong>Email:</strong> privacy@kazinest.co.ke
                  </li>
                  <li>
                    <strong>Phone:</strong> +254708112672
                  </li>
                  <li>
                    <strong>Address:</strong> 9 West, Westlands, Nairobi, Kenya
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
