import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron job endpoint to send subscription expiration warnings
 * Triggered daily to notify users 1 day before their subscription expires
 * Email sent to users with active professional subscriptions
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

    console.log("[v0] Subscription expiration reminder cron job started")

    const { notifyExpiringSoon } = await import("@/lib/subscription-expiration-notifier")

    // Send notifications for subscriptions expiring tomorrow
    const result = await notifyExpiringSoon()

    return NextResponse.json(
      {
        success: true,
        message: "Subscription expiration reminders processed",
        ...result,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Subscription expiration reminder error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
