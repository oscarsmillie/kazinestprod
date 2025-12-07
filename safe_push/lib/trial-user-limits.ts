import { supabase, supabaseAdmin } from "./supabase"
import { isTrialActive } from "./trials"

/**
 * Track trial resume downloads to enforce 1 free download limit
 * New utility to track trial user resume downloads
 */
export const trackTrialResumeDownload = async (userId: string): Promise<number> => {
  if (!userId) return 0

  try {
    const currentMonth = new Date().toISOString().slice(0, 7)

    const { data: existing, error: selectError } = await supabaseAdmin
      .from("usage_tracking")
      .select("id, resumes_downloaded")
      .eq("user_id", userId)
      .eq("month_year", currentMonth)
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("[v0] Error checking trial usage:", selectError)
      return 0
    }

    if (existing) {
      const newValue = (existing.resumes_downloaded || 0) + 1
      const { error: updateError } = await supabaseAdmin
        .from("usage_tracking")
        .update({ resumes_downloaded: newValue, updated_at: new Date().toISOString() })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[v0] Error updating trial usage:", updateError)
        return 0
      }

      return newValue
    }

    // Create new trial usage entry
    const { error: insertError } = await supabaseAdmin.from("usage_tracking").insert({
      user_id: userId,
      month_year: currentMonth,
      resumes_downloaded: 1,
      cover_letters_generated: 0,
      emails_generated: 0,
      job_applications: 0,
      interview_sessions: 0,
      career_coaching: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError && insertError.code !== "23505") {
      console.error("[v0] Error creating trial usage:", insertError)
      return 0
    }

    return 1
  } catch (error) {
    console.error("[v0] Error in trackTrialResumeDownload:", error)
    return 0
  }
}

/**
 * Check if trial user has used their free resume download
 * Verify if trial user can still download one free resume
 */
export const hasTrialResumeDownloadAvailable = async (userId: string): Promise<boolean> => {
  if (!userId) return false

  try {
    const isOnTrial = await isTrialActive(userId)
    if (!isOnTrial) return false

    const currentMonth = new Date().toISOString().slice(0, 7)

    const { data: usage, error } = await supabase
      .from("usage_tracking")
      .select("resumes_downloaded")
      .eq("user_id", userId)
      .eq("month_year", currentMonth)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error checking trial availability:", error)
      return false
    }

    // Trial users can download 1 resume for free (with watermark)
    const downloadsUsed = usage?.resumes_downloaded || 0
    return downloadsUsed < 1
  } catch (error) {
    console.error("[v0] Error in hasTrialResumeDownloadAvailable:", error)
    return false
  }
}

/**
 * Get user type including trial status
 * Determine if user is on trial, free, or professional
 */
export const getUserTypeWithTrial = async (userId: string): Promise<"trial" | "free" | "professional" | "unknown"> => {
  if (!userId) return "unknown"

  try {
    // Check if user is on trial
    const isOnTrial = await isTrialActive(userId)
    if (isOnTrial) return "trial"

    // Check subscription type
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("plan_type, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error checking user type:", error)
      return "unknown"
    }

    const planType = subscription?.plan_type || "free"
    return planType === "professional" ? "professional" : "free"
  } catch (error) {
    console.error("[v0] Error in getUserTypeWithTrial:", error)
    return "unknown"
  }
}
