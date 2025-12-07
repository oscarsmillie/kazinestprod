import { createBackendSupabaseClient } from "@/lib/supabase"
import { getUserTrial, getTrialDaysRemaining } from "@/lib/trials"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/trials/status
 * Returns the trial status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createBackendSupabaseClient()

    // Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trial = await getUserTrial(user.id)
    const daysRemaining = await getTrialDaysRemaining(user.id)

    if (!trial) {
      return NextResponse.json({
        hasTrial: false,
        trial: null,
        daysRemaining: 0,
      })
    }

    return NextResponse.json({
      hasTrial: trial.status === "active",
      trial,
      daysRemaining,
    })
  } catch (error) {
    console.error("[v0] Trial status error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
