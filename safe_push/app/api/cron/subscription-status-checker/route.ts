import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron job to check and enforce subscription status
 * - Downgrade users with expired subscriptions
 * - Update subscription status flags
 * - Prevent edge cases where subscriptions remain active past expiration
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

    console.log("[v0] Subscription status checker cron job started")

    const now = new Date()
    const nowISO = now.toISOString()

    // Find active subscriptions that have expired
    const { data: expiredSubs, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_type, current_period_end, status")
      .eq("status", "active")
      .eq("is_active", true)
      .lt("current_period_end", nowISO)

    if (fetchError) {
      console.error("[v0] Error fetching expired subscriptions:", fetchError)
      return NextResponse.json({ success: false, error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    let processed = 0
    let errors = 0

    for (const sub of expiredSubs || []) {
      try {
        console.log(`[v0] Downgrading expired subscription for user ${sub.user_id}`)

        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_type: "free",
            status: "active",
            is_active: true,
            current_period_start: nowISO,
            current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: nowISO,
          })
          .eq("id", sub.id)

        if (updateError) {
          console.error("[v0] Error updating subscription:", updateError)
          errors++
          continue
        }

        // Log demotion
        await supabaseAdmin.from("user_activity").insert({
          user_id: sub.user_id,
          activity_type: "subscription_expired",
          description: `Subscription expired and downgraded to free plan (was ${sub.plan_type})`,
          metadata: {
            subscription_id: sub.id,
            previous_plan: sub.plan_type,
            expiration_date: sub.current_period_end,
          },
        })

        processed++
      } catch (error) {
        console.error("[v0] Error processing subscription:", sub.id, error)
        errors++
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription status check completed",
        processed,
        errors,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Subscription status checker error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
