import { supabase, supabaseAdmin } from "./supabase"
import { sendEmail } from "./email"

/**
 * Email template for subscription expiration warning (1 day before)
 */
export function subscriptionExpirationWarningTemplate(
  userName: string,
  expirationDate: string,
  dashboardUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your KaziNest Subscription Expires Soon</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Subscription Expiration Notice</h1>
            </div>
            <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Your KaziNest Professional subscription will expire in <strong>1 day</strong> on <strong>${expirationDate}</strong>.</p>
                
                <div class="warning-box">
                    <strong>⚠️ Important:</strong> After your subscription expires, you will be downgraded to the free plan and lose access to premium features including unlimited resumes, cover letters, and emails.
                </div>
                
                <h3>What happens after expiration?</h3>
                <ul>
                    <li>Your plan will downgrade to the free tier</li>
                    <li>Free plan limits will apply to all features</li>
                    <li>You can renew at any time from your dashboard</li>
                </ul>
                
                <h3>Renew your subscription:</h3>
                <p>To continue enjoying unlimited access to all premium features, renew your subscription now:</p>
                
                <a href="${dashboardUrl}/pricing" class="button">Renew Subscription</a>
                
                <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                
                <p>Best regards,<br><strong>The KaziNest Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 KaziNest. All rights reserved.</p>
                <p><a href="${dashboardUrl}/settings" style="color: #2563eb; text-decoration: none;">Manage Subscription</a></p>
            </div>
        </div>
    </body>
    </html>
  `
}

/**
 * Send subscription expiration warning email (1 day before expiration)
 */
export async function sendSubscriptionExpirationWarning(
  email: string,
  userName: string,
  expirationDate: string,
  dashboardUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const html = subscriptionExpirationWarningTemplate(userName, expirationDate, dashboardUrl)
  return sendEmail({
    to: email,
    subject: "Your KaziNest Subscription Expires Tomorrow",
    html,
    from: "KaziNest <noreply@kazinest.co.ke>",
  })
}

/**
 * Cron job to find subscriptions expiring in 1 day and send notifications
 */
export const notifyExpiringSoon = async (): Promise<{ processed: number; errors: number }> => {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowEnd = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)

    const nowISO = now.toISOString()
    const tomorrowISO = tomorrow.toISOString()
    const tomorrowEndISO = tomorrowEnd.toISOString()

    console.log("[v0] Searching for subscriptions expiring between", tomorrowISO, "and", tomorrowEndISO)

    // Find subscriptions that expire in exactly 1 day
    const { data: expiringSubscriptions, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, current_period_end, status")
      .eq("status", "active")
      .eq("plan_type", "professional")
      .gte("current_period_end", tomorrowISO)
      .lt("current_period_end", tomorrowEndISO)

    if (fetchError) {
      console.error("[v0] Error fetching expiring subscriptions:", fetchError)
      return { processed: 0, errors: 1 }
    }

    let processed = 0
    let errors = 0

    for (const subscription of expiringSubscriptions || []) {
      try {
        // Get user details
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id)

        if (authError || !authUser?.user?.email) {
          console.error("[v0] Error fetching user email:", authError, subscription.user_id)
          errors++
          continue
        }

        const userEmail = authUser.user.email
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("user_id", subscription.user_id)
          .maybeSingle()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("[v0] Error fetching user profile:", profileError)
          errors++
          continue
        }

        const userName = profile?.full_name || userEmail.split("@")[0]
        const expirationDate = new Date(subscription.current_period_end).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kazinest.co.ke"

        // Send email
        const emailResult = await sendSubscriptionExpirationWarning(userEmail, userName, expirationDate, dashboardUrl)

        if (!emailResult.success) {
          console.error("[v0] Failed to send expiration warning email:", emailResult.error)
          errors++
          continue
        }

        // Log notification
        await supabaseAdmin.from("user_activity").insert({
          user_id: subscription.user_id,
          activity_type: "subscription_expiration_warning",
          description: `Subscription expiration warning sent. Expires on ${expirationDate}`,
          metadata: {
            subscription_id: subscription.id,
            expiration_date: subscription.current_period_end,
            email_sent: true,
          },
        })

        processed++
        console.log("[v0] Expiration warning sent to", userEmail)
      } catch (error) {
        console.error("[v0] Error processing subscription:", subscription.id, error)
        errors++
      }
    }

    console.log(`[v0] Subscription expiration notifications: ${processed} sent, ${errors} errors`)
    return { processed, errors }
  } catch (error) {
    console.error("[v0] Error in notifyExpiringSoon:", error)
    return { processed: 0, errors: 1 }
  }
}
