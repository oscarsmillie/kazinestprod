import { createBackendSupabaseClient } from "@/lib/supabase"
import { validateDiscount, calculateDiscountAmount } from "@/lib/discounts"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/discounts/validate
 * Validates a discount code and calculates the discounted amount
 *
 * Request body:
 * {
 *   code: string,
 *   amount: number,
 *   planType?: string (default: "professional"),
 *   userId: string
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
    const { code, amount, planType = "professional" } = body

    if (!code || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid code or amount" }, { status: 400 })
    }

    const validation = await validateDiscount(code, user.id, amount, planType)

    if (!validation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error,
        },
        { status: 400 },
      )
    }

    const calculation = calculateDiscountAmount(amount, validation.discount!)

    return NextResponse.json({
      valid: true,
      discount: validation.discount,
      calculation,
    })
  } catch (error) {
    console.error("[v0] Discount validation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
