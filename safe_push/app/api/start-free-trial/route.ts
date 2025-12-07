import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has an active trial
    const { data: existingTrial } = await supabase
      .from("trial_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (existingTrial) {
      return NextResponse.json({ error: "You already have an active trial" }, { status: 400 })
    }

    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { data: trial, error: trialError } = await supabaseAdmin
      .from("trial_subscriptions")
      .insert({
        user_id: user.id,
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (trialError) {
      console.error("[v0] Error creating trial:", trialError)
      return NextResponse.json({ error: "Failed to create trial" }, { status: 500 })
    }

    const { error: subError } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan_type: "professional",
        status: "active",
        is_active: true,
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString(),
        trial_end: trialEnd.toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (subError) {
      console.error("[v0] Error updating subscription:", subError)
      return NextResponse.json({ error: "Failed to activate professional plan" }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin.from("user_activity").insert({
      user_id: user.id,
      activity_type: "trial_started",
      description: "User started 7-day free professional trial",
      metadata: {
        trial_id: trial.id,
        trial_end: trialEnd.toISOString(),
      },
    })

    console.log("[v0] Trial started for user:", user.id)

    return NextResponse.json({
      success: true,
      message: "7-day trial activated! You now have professional access.",
      trial,
    })
  } catch (error: any) {
    console.error("[v0] Error in start-free-trial:", error)
    return NextResponse.json({ error: error.message || "Failed to start trial" }, { status: 500 })
  }
}
