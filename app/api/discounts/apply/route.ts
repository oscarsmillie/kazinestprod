import { createBackendSupabaseClient } from "@/lib/supabase"
import { validateDiscount, calculateDiscountAmount, recordDiscountUsage } from "@/lib/discounts"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/discounts/apply
 * Applies a discount code to a payment and records the usage
 *
 * Request body:
 * {
 *   code: string,
 *   amount: number,
 *   planType?: string,
 *   paymentId?: string
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { code, amount, planType = "professional", paymentId } = body

    const validation = await validateDiscount(code, user.id, amount, planType)

    if (!validation.valid) {
      return NextResponse.json(
        {
          applied: false,
          error: validation.error,
        },
        { status: 400 },
      )
    }

    const calculation = calculateDiscountAmount(amount, validation.discount!)

    const recorded = await recordDiscountUsage(user.id, validation.discount!.id, paymentId)

    if (!recorded) {
      return NextResponse.json(
        {
          applied: false,
          error: "Failed to apply discount",
        },
        { status: 500 },
      )
    }

    // Log activity
    const { supabaseAdmin } = await import("@/lib/supabase")
    await supabaseAdmin.from("user_activity").insert({
      user_id: user.id,
      activity_type: "discount_applied",
      description: `Applied discount code ${code}`,
      metadata: {
        discount_code: code,
        original_amount: calculation.originalAmount,
        discount_amount: calculation.discountAmount,
        final_amount: calculation.finalAmount,
        payment_id: paymentId,
      },
    })

    return NextResponse.json({
      applied: true,
      calculation,
      message: "Discount applied successfully",
    })
  } catch (error) {
    console.error("[v0] Apply discount error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
