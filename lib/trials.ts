import { supabase, supabaseAdmin } from "./supabase"

export interface TrialSubscription {
  id: string
  user_id: string
  trial_start: string
  trial_end: string
  status: "active" | "converted" | "expired" | "cancelled"
  created_at: string
  updated_at: string
}

export const createTrialSubscription = async (userId: string): Promise<TrialSubscription | null> => {
  try {
    // Check if user already has an active trial
    const { data: existingTrial, error: fetchError } = await supabase
      .from("trial_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error checking existing trial:", fetchError)
      return null
    }

    if (existingTrial) {
      console.log("[v0] User already has an active trial")
      return existingTrial
    }

    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { data: trial, error } = await supabaseAdmin
      .from("trial_subscriptions")
      .insert({
        user_id: userId,
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating trial subscription:", error)
      return null
    }

    console.log("[v0] Trial subscription created for user:", userId)
    return trial
  } catch (error) {
    console.error("[v0] Error in createTrialSubscription:", error)
    return null
  }
}

export const getUserTrial = async (userId: string): Promise<TrialSubscription | null> => {
  try {
    const { data: trial, error } = await supabase
      .from("trial_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching user trial:", error)
      return null
    }

    return trial || null
  } catch (error) {
    console.error("[v0] Error in getUserTrial:", error)
    return null
  }
}

export const isTrialActive = async (userId: string): Promise<boolean> => {
  try {
    const trial = await getUserTrial(userId)
    if (!trial) return false

    const now = new Date()
    const trialEnd = new Date(trial.trial_end)

    return now < trialEnd && trial.status === "active"
  } catch (error) {
    console.error("[v0] Error checking trial status:", error)
    return false
  }
}

export const getTrialDaysRemaining = async (userId: string): Promise<number> => {
  try {
    const trial = await getUserTrial(userId)
    if (!trial) return 0

    const now = new Date()
    const trialEnd = new Date(trial.trial_end)

    if (trialEnd <= now) return 0

    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  } catch (error) {
    console.error("[v0] Error calculating trial days:", error)
    return 0
  }
}

export const convertTrialToSubscription = async (userId: string): Promise<boolean> => {
  try {
    // Update trial status to converted
    const { error: trialError } = await supabaseAdmin
      .from("trial_subscriptions")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active")

    if (trialError) {
      console.error("[v0] Error updating trial status:", trialError)
      return false
    }

    // Log conversion
    const { data: trial } = await supabase
      .from("trial_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "converted")
      .maybeSingle()

    if (trial) {
      await supabaseAdmin.from("trial_conversion_logs").insert({
        user_id: userId,
        trial_id: trial.id,
        action: "converted",
        description: "Trial converted to paid subscription",
      })
    }

    console.log("[v0] Trial converted to subscription for user:", userId)
    return true
  } catch (error) {
    console.error("[v0] Error in convertTrialToSubscription:", error)
    return false
  }
}

export const expireTrial = async (userId: string): Promise<boolean> => {
  try {
    // Update trial to expired
    const { data: trial, error: updateError } = await supabaseAdmin
      .from("trial_subscriptions")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active")
      .select()
      .single()

    if (updateError) {
      console.log("[v0] No active trial to expire or error:", updateError)
      return false
    }

    // Log expiration
    await supabaseAdmin.from("trial_conversion_logs").insert({
      user_id: userId,
      trial_id: trial.id,
      action: "expired",
      description: "Trial period ended",
    })

    console.log("[v0] Trial expired for user:", userId)
    return true
  } catch (error) {
    console.error("[v0] Error in expireTrial:", error)
    return false
  }
}

export const handleExpiredTrials = async (): Promise<{ processed: number; errors: number }> => {
  try {
    const now = new Date().toISOString()

    // Find all active trials that have expired
    const { data: expiredTrials, error: fetchError } = await supabase
      .from("trial_subscriptions")
      .select("id, user_id")
      .eq("status", "active")
      .lt("trial_end", now)

    if (fetchError) {
      console.error("[v0] Error fetching expired trials:", fetchError)
      return { processed: 0, errors: 1 }
    }

    let processed = 0
    let errors = 0

    for (const trial of expiredTrials || []) {
      try {
        // Check if user has a paid subscription that's still active
        const { data: subscription, error: subError } = await supabase
          .from("subscriptions")
          .select("status, plan_type, current_period_end")
          .eq("user_id", trial.user_id)
          .eq("status", "active")
          .maybeSingle()

        if (subError && subError.code !== "PGRST116") {
          console.error("[v0] Error checking subscription:", subError)
          errors++
          continue
        }

        const isPaidSubstillActive =
          subscription &&
          subscription.plan_type === "professional" &&
          subscription.status === "active" &&
          (!subscription.current_period_end || new Date(subscription.current_period_end) > now)

        // If user doesn't have an active paid subscription, downgrade to free
        if (!isPaidSubstillActive) {
          const { error: freeSubError } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: trial.user_id,
              plan_type: "free",
              status: "active",
              is_active: true,
              current_period_start: now.toISOString(),
              current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            { onConflict: "user_id" },
          )

          if (freeSubError) {
            console.error("[v0] Error creating free subscription:", freeSubError)
            errors++
            continue
          }
        }

        // Mark trial as expired
        await expireTrial(trial.user_id)

        // Log activity
        await supabaseAdmin.from("user_activity").insert({
          user_id: trial.user_id,
          activity_type: "trial_expired",
          description: isPaidSubstillActive
            ? "7-day trial period ended. Professional subscription remains active."
            : "7-day trial period ended. Downgraded to free plan.",
          metadata: {
            trial_id: trial.id,
            had_paid_subscription: isPaidSubstillActive,
          },
        })

        processed++
      } catch (error) {
        console.error("[v0] Error processing trial:", trial.id, error)
        errors++
      }
    }

    console.log(`[v0] Trial expiration handled: ${processed} processed, ${errors} errors`)
    return { processed, errors }
  } catch (error) {
    console.error("[v0] Error in handleExpiredTrials:", error)
    return { processed: 0, errors: 1 }
  }
}
