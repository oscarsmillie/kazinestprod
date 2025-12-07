export const JOB_BOARD_CONFIG = {
  FREE_USERS_PAGES: 2,
  JOBS_PER_PAGE: 10, // Changed from 15 to 10 jobs per page
  SCRAPE_RATE_LIMIT: 100, // requests per hour
  SUSPICIOUS_USER_AGENTS: ["bot", "scraper", "crawler", "spider", "wget", "curl"],
}

export function isSuspiciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return JOB_BOARD_CONFIG.SUSPICIOUS_USER_AGENTS.some((agent) => ua.includes(agent))
}

export function calculateMaxPageForUser(isProfessional: boolean): number {
  return isProfessional ? Number.POSITIVE_INFINITY : JOB_BOARD_CONFIG.FREE_USERS_PAGES
}

export function parseJobTitle(titleString: string): { company: string; title: string } {
  // Check if title contains colon separator (e.g., "DFW Turf Solutions: Blog Writer")
  if (titleString.includes(":")) {
    const [company, title] = titleString.split(":").map((s) => s.trim())
    if (company && title) {
      return { company, title }
    }
  }
  // If no colon, return original title
  return { company: "", title: titleString }
}
