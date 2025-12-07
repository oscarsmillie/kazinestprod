"use client"
import { Mail, MapPin, Globe } from "lucide-react"
import Link from "next/link"

export function FrontFooter() {
  const footerLinks = {
    Product: [
      { name: "Resume Builder", href: "/products/resume-builder" },
      { name: "Cover Letters", href: "/products/cover-letters" },
      { name: "Job Board", href: "/products/job-board" },
      { name: "Interview Prep", href: "/products/interview-prep" },
      { name: "Job Tracker", href: "/products/job-tracker" },
      { name: "Career Coach", href: "/products/career-coach" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Pricing", href: "/front-pricing" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    Resources: [
      { name: "Help Center", href: "/" },
      { name: "Community", href: "/" },
      { name: "Career Tips", href: "/blog" },
      { name: "Webinars", href: "/" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/" },
      { name: "Cookie Policy", href: "/" },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">KN</span>
              </div>
              <span className="text-xl font-semibold">KaziNest</span>
            </Link>
            <p className="text-gray-400 mb-4">Built for Africa, Open to the World.</p>
            <p className="text-gray-400 mb-6">
              Empowering African professionals to compete globally and win their dream jobs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Globe size={16} />
                <span>www.kazinest.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={16} />
                <span>info@kazinest.co.ke</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} />
                <span>9 West, Westlands, Nairobi</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-white font-semibold">Product</h3>
            <ul className="space-y-2">
              {footerLinks.Product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-orange-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-white font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-orange-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-white font-semibold">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.Resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-orange-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-white font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.Legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-orange-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© 2025 KaziNest. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
