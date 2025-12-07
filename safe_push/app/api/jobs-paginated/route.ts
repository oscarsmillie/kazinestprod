import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { hasProfessionalAccess } from "@/lib/access-control"
import { fetchJobs } from "@/lib/fetch-jobs"
import { JOB_BOARD_CONFIG } from "@/lib/job-board-utils"

const JOBS_PER_PAGE = JOB_BOARD_CONFIG.JOBS_PER_PAGE
const MAX_FREE_PAGES = JOB_BOARD_CONFIG.FREE_USERS_PAGES
const SCRAPE_THRESHOLD = 100 // requests per hour

// Simple in-memory rate limiting (replace with Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const userData = requestCounts.get(clientId)

  if (!userData || now > userData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + 3600000 }) // 1 hour
    return true
  }

  if (userData.count >= SCRAPE_THRESHOLD) {
    return false
  }

  userData.count++
  return true
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const type = searchParams.get("type") || ""
    const level = searchParams.get("level") || ""

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

    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""

    // Detect scrapers by user-agent
    const isSuspiciousAgent =
      !userAgent || userAgent.toLowerCase().includes("bot") || userAgent.toLowerCase().includes("scraper")

    if (!user && isSuspiciousAgent) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!checkRateLimit(clientIp)) {
      return Response.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const isProfessional = user ? await hasProfessionalAccess(user.id) : false

    if (!isProfessional && page > MAX_FREE_PAGES) {
      return Response.json(
        {
          error: "Free users can access only the first 2 pages. Upgrade to premium for unlimited access.",
          pageLimit: MAX_FREE_PAGES,
          requiresUpgrade: true,
        },
        { status: 403 },
      )
    }

    // Free users are limited to MAX_FREE_PAGES by the check above
    const offset = (page - 1) * JOBS_PER_PAGE

    const jobs = await fetchJobs({ limit: JOBS_PER_PAGE, offset, search, category, type, level })

    console.log(`[v0] Fetching page ${page} for user: ${isProfessional ? "professional" : "free"}`)

    return Response.json({
      jobs,
      page,
      limit: JOBS_PER_PAGE,
      isProfessional,
      canAccessAllPages: isProfessional,
      totalPages: null, // Don't expose total count to prevent scraping
      message: !isProfessional && page === MAX_FREE_PAGES ? "Upgrade to view more jobs" : undefined,
    })
  } catch (error) {
    console.error("[v0] API Route: Error fetching jobs:", error)
    return Response.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
