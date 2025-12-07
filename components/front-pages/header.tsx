"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function FrontHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Pricing", href: "/front-pricing" },
    { name: "Contact", href: "/contact" },
  ]

  const handleNavClick = () => {
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const isActive = (href: string) => pathname === href

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black/40 via-black/30 to-transparent backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" onClick={handleNavClick} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">KN</span>
              </div>
              <span className="text-xl text-white font-semibold">KaziNest</span>
            </Link>
          </div>

          {/* Desktop Navigation - simplified without dropdown */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive(link.href)
                    ? "bg-white/20 text-white backdrop-blur-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/auth"
              className="ml-4 px-6 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - simplified */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/20 bg-black/60 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.href) ? "bg-white/20 text-white" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/auth"
                onClick={handleNavClick}
                className="block w-full px-6 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg mt-4 text-center"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
