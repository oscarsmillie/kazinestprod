import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { hasProfessionalAccess } from "@/lib/access-control"
import { isTrialActive } from "@/lib/trials"

export async function GET() {
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
      return Response.json({ userType: "free" })
    }

    const isProfessional = await hasProfessionalAccess(user.id)
    if (isProfessional) {
      return Response.json({ userType: "professional" })
    }

    const isTrial = await isTrialActive(user.id)
    if (isTrial) {
      return Response.json({ userType: "trial" })
    }

    return Response.json({ userType: "free" })
  } catch (error) {
    console.error("[v0] Error getting user type:", error)
    return Response.json({ userType: "free" })
  }
}
