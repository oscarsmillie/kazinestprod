import { supabase, supabaseAdmin } from "./supabase"

export interface Discount {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  currency: string
  max_uses: number | null
  current_uses: number
  min_amount: number | null
  max_amount: number | null
  applicable_plans: string[]
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface DiscountCalculationResult {
  originalAmount: number
  discountAmount: number
  finalAmount: number
  discountCode: string
  discountPercentage?: number
}

export const validateDiscount = async (
  code: string,
  userId: string,
  amount: number,
  planType = "professional",
): Promise<{ valid: boolean; error?: string; discount?: Discount }> => {
  try {
    // Fetch discount by code
    const { data: discount, error: fetchError } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase())
      .maybeSingle()

    if (fetchError || !discount) {
      return { valid: false, error: "Discount code not found" }
    }

    // Check if discount is active
    if (!discount.is_active) {
      return { valid: false, error: "This discount code is no longer active" }
    }

    // Check if discount has started
    if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
      return { valid: false, error: "This discount code is not yet available" }
    }

    // Check if discount has expired
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return { valid: false, error: "This discount code has expired" }
    }

    // Check if max uses reached
    if (discount.max_uses && discount.current_uses >= discount.max_uses) {
      return { valid: false, error: "This discount code has reached its usage limit" }
    }

    // Check if applicable to plan
    if (discount.applicable_plans && !discount.applicable_plans.includes(planType)) {
      return { valid: false, error: `This discount is not applicable to the ${planType} plan` }
    }

    // Check minimum amount
    if (discount.min_amount && amount < discount.min_amount) {
      return {
        valid: false,
        error: `Minimum purchase amount of ${discount.currency} ${discount.min_amount} required`,
      }
    }

    // Check maximum amount
    if (discount.max_amount && amount > discount.max_amount) {
      return {
        valid: false,
        error: `Maximum purchase amount of ${discount.currency} ${discount.max_amount} exceeded`,
      }
    }

    // Check if user has already used this discount
    const { data: usageData, error: usageError } = await supabase
      .from("user_discount_usage")
      .select("id")
      .eq("user_id", userId)
      .eq("discount_id", discount.id)
      .maybeSingle()

    if (usageError && usageError.code !== "PGRST116") {
      return { valid: false, error: "Error checking discount usage" }
    }

    if (usageData) {
      return { valid: false, error: "You have already used this discount code" }
    }

    return { valid: true, discount }
  } catch (error) {
    console.error("[v0] Error validating discount:", error)
    return { valid: false, error: "Error validating discount code" }
  }
}

export const calculateDiscountAmount = (originalAmount: number, discount: Discount): DiscountCalculationResult => {
  let discountAmount = 0

  if (discount.discount_type === "percentage") {
    discountAmount = (originalAmount * discount.discount_value) / 100
  } else {
    discountAmount = discount.discount_value
  }

  // Ensure discount doesn't exceed original amount
  discountAmount = Math.min(discountAmount, originalAmount)

  const finalAmount = Math.max(0, originalAmount - discountAmount)

  return {
    originalAmount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    discountCode: discount.code,
    discountPercentage: discount.discount_type === "percentage" ? discount.discount_value : undefined,
  }
}

export const recordDiscountUsage = async (userId: string, discountId: string, paymentId?: string): Promise<boolean> => {
  try {
    // Record usage
    const { error: usageError } = await supabaseAdmin.from("user_discount_usage").insert({
      user_id: userId,
      discount_id: discountId,
      payment_id: paymentId || null,
    })

    if (usageError) {
      console.error("[v0] Error recording discount usage:", usageError)
      return false
    }

    // Increment discount usage count
    const { error: updateError } = await supabaseAdmin
      .from("discounts")
      .update({ current_uses: supabase.raw("current_uses + 1") })
      .eq("id", discountId)

    if (updateError) {
      console.error("[v0] Error updating discount usage count:", updateError)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error in recordDiscountUsage:", error)
    return false
  }
}

export const getApplicableDiscounts = async (userId: string, planType = "professional"): Promise<Discount[]> => {
  try {
    const now = new Date().toISOString()

    const { data: discounts, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("discount_value", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching discounts:", error)
      return []
    }

    // Filter by applicable plans and max uses
    const applicableDiscounts = (discounts || []).filter((d) => {
      const planMatch = !d.applicable_plans || d.applicable_plans.includes(planType)
      const usesCheck = !d.max_uses || d.current_uses < d.max_uses
      return planMatch && usesCheck
    })

    return applicableDiscounts
  } catch (error) {
    console.error("[v0] Error in getApplicableDiscounts:", error)
    return []
  }
}

export const getUserDiscountHistory = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("user_discount_usage")
      .select("*, discounts(code, description, discount_value, discount_type)")
      .eq("user_id", userId)
      .order("used_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user discount history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getUserDiscountHistory:", error)
    return []
  }
}
