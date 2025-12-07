import type React from "react"
import { FrontHeader } from "@/components/front-pages/header"
import { FrontFooter } from "@/components/front-pages/footer"

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <FrontHeader />
      {children}
      <FrontFooter />
    </div>
  )
}
