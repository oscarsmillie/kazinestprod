import { type NextRequest, NextResponse } from "next/server"
import { handleExpiredTrials } from "@/lib/trials"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron job endpoint to handle trial expirations and auto-billing
 * Triggered periodically (e.g., daily) to:
 * - Expire trials that have passed their trial_end date
 * - Downgrade expired trial users to free plan
 * - Log trial expiration in activity
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET
    const headerSecret = request.headers.get("x-cron-secret")

    if (!cronSecret || headerSecret !== cronSecret) {
      console.error("[v0] Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Trial expiration cron job started")

    // Process expired trials
    const result = await handleExpiredTrials()

    return NextResponse.json(
      {
        success: true,
        message: "Trial expiration processed",
        ...result,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Trial expiration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
