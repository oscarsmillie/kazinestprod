"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Lock, Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradePromptProps {
  title: string
  description: string
  onClose: () => void
}

export function UpgradePrompt({ title, description, onClose }: UpgradePromptProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Premium Benefits:</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1 ml-6">
              <li>✓ Access all job listings</li>
              <li>✓ Unlimited job applications</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced filters & search</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Later
            </Button>
            <Button onClick={handleUpgrade} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
