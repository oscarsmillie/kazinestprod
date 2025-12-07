export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { validateDiscount, calculateDiscountAmount, recordDiscountUsage } from "@/lib/discounts"
import { createBackendSupabaseClient } from "@/lib/supabase"
import { paystack } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const supabase = createBackendSupabaseClient()

    // --- Authenticate user ---
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token in header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized: Invalid or unauthenticated user" }, { status: 401 })
    }

    const authenticatedUserId = user.id

    // --- Parse body ---
    const body = await request.json()
    const { amount, currency = "KES", type, resumeId, description, plan, discountCode } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // --- Determine effective payment type ---
    const effectivePaymentType = plan ? "professional_upgrade" : type

    // --- Validate effective payment type ---
    const allowedTypes = ["resume_download", "extra_resume_download", "professional_upgrade"]
    if (!allowedTypes.includes(effectivePaymentType)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 })
    }

    // --- Validate currency ---
    const finalCurrency = currency.toUpperCase()
    if (!["KES", "USD"].includes(finalCurrency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 })
    }

    let finalAmount = amount
    let discountInfo = null

    if (discountCode) {
      const validation = await validateDiscount(discountCode, authenticatedUserId, amount, "professional")

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const calculation = calculateDiscountAmount(amount, validation.discount!)
      finalAmount = calculation.finalAmount
      discountInfo = {
        code: discountCode,
        discountId: validation.discount!.id,
        originalAmount: calculation.originalAmount,
        discountAmount: calculation.discountAmount,
        finalAmount: calculation.finalAmount,
      }
    }

    const isPaystackPlanCode = plan?.startsWith("PLN_")

    // --- Build metadata for Paystack ---
    const metadata = {
      user_id: authenticatedUserId,
      plan: plan || "monthly",
      payment_type: effectivePaymentType,
      resume_id: resumeId || null,
      description: description || `${effectivePaymentType} payment`,
      discount_code: discountCode || null,
      custom_fields: [
        { display_name: "Plan", variable_name: "plan", value: plan || "monthly" },
        { display_name: "User ID", variable_name: "user_id", value: authenticatedUserId },
        { display_name: "Payment Type", variable_name: "payment_type", value: effectivePaymentType },
        ...(resumeId ? [{ display_name: "Resume ID", variable_name: "resume_id", value: resumeId }] : []),
        ...(discountCode
          ? [{ display_name: "Discount Code", variable_name: "discount_code", value: discountCode }]
          : []),
      ],
    }

    // --- Initialize Paystack transaction ---
    const initializationArgs = {
      email: user.email!,
      amount: finalAmount,
      currency: finalCurrency,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kazinest.vercel.app"}/payment/callback?type=${effectivePaymentType}${resumeId ? `&resumeId=${resumeId}` : ""}${plan ? `&planId=${plan}` : ""}`,
      metadata,
      ...(isPaystackPlanCode && { plan }),
    }

    const paymentData = await paystack.initializeTransaction(initializationArgs)

    // --- Store payment record ---
    const { data: paymentRecord } = await supabase
      .from("payments")
      .insert({
        user_id: authenticatedUserId,
        reference: paymentData.data.reference,
        status: "pending",
        amount: finalAmount,
        currency: finalCurrency,
        plan: plan || null,
        description: description || effectivePaymentType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (discountInfo && paymentRecord) {
      await recordDiscountUsage(authenticatedUserId, discountInfo.discountId, paymentRecord.id)
    }

    return NextResponse.json({
      success: true,
      data: paymentData.data,
      message: "Payment initialized successfully",
      discount: discountInfo,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Payment initialization failed",
        success: false,
      },
      { status: 500 },
    )
  }
}
