// jobs.ts
import { supabaseAdmin } from "./supabase"
import { parseJobTitle } from "./job-board-utils"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
  posted_date: string
  deadline: string
  category: string
  experience_level: string
  skills: string[]
  company_logo: string
  application_url: string
  is_premium?: boolean
  is_featured?: boolean
}

export async function fetchJobs(
  options: {
    limit?: number
    offset?: number
    search?: string
    category?: string
    type?: string
    level?: string
  } = {},
): Promise<Job[]> {
  const { limit = 100, offset = 0, search = "", category = "", type = "", level = "" } = options

  console.log("[v0] fetchJobs called with options:", { limit, offset, search, category, type, level })
  const allJobs: Job[] = []

  try {
    const client = supabaseAdmin

    // Fetch internal jobs
    console.log("[v0] Attempting to fetch from internal database (job_postings)...")
    let internalQuery = client
      .from("job_postings")
      .select("*")
      .eq("is_active", true)
      .order("posted_date", { ascending: false })

    if (search)
      internalQuery = internalQuery.or(
        `job_title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`,
      )
    if (category) internalQuery = internalQuery.eq("industry", category)
    if (type) internalQuery = internalQuery.eq("job_type", type)
    if (level) internalQuery = internalQuery.eq("experience_level", level)

    const { data: internalData, error: internalError } = await internalQuery
    if (internalError) {
      console.error("[v0] Error fetching internal jobs:", internalError)
    } else {
      console.log(`[v0] Internal jobs query returned ${internalData?.length || 0} rows`)
      if (internalData) {
        allJobs.push(
          ...internalData.map((job: any) => {
            const parsedTitle = parseJobTitle(job.job_title || "Position Available")
            const company = parsedTitle.company || job.company_name || "Company Name Not Provided"
            const title = parsedTitle.title || "Position Available"

            return {
              id: job.id,
              title,
              company,
              location: job.location || "Location Not Specified",
              type: job.job_type || "Full-time",
              salary: job.salary_range || "Competitive Salary",
              description: job.description || "Full job description available on application.",
              requirements: Array.isArray(job.requirements) ? job.requirements : [],
              posted_date: job.posted_date || new Date().toISOString(),
              deadline: job.application_deadline || "",
              category: job.industry || "Technology",
              experience_level: job.experience_level || "Mid-Level",
              skills: Array.isArray(job.skills_required) ? job.skills_required : [],
              company_logo: job.company_logo_url || "",
              application_url: job.external_url || job.application_email || "",
              is_premium: job.is_featured || false,
              is_featured: job.is_featured || false,
            }
          }),
        )
      }
    }

    // Fetch external jobs
    console.log("[v0] Attempting to fetch from external database (external_jobs)...")
    let externalQuery = client.from("external_jobs").select("*").order("posted_date", { ascending: false })

    if (search)
      externalQuery = externalQuery.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`,
      )
    if (category) externalQuery = externalQuery.ilike("category", `%${category}%`)
    if (type) externalQuery = externalQuery.ilike("job_type", `%${type}%`)
    if (level) externalQuery = externalQuery.ilike("experience_level", `%${level}%`)

    const { data: externalData, error: externalError } = await externalQuery
    if (externalError) {
      console.error("[v0] Error fetching external jobs:", externalError)
    } else {
      console.log(`[v0] External jobs query returned ${externalData?.length || 0} rows`)
      if (externalData) {
        allJobs.push(
          ...externalData.map((job: any) => {
            const parsedTitle = parseJobTitle(job.title || "Position Available")
            const company = parsedTitle.company || job.company || "Company Name Not Provided"
            const title = parsedTitle.title || "Position Available"

            return {
              id: job.id || job.external_id,
              title,
              company,
              location: job.location || "Location Not Specified",
              type: job.job_type || "Full-time",
              salary: job.salary || "Competitive Salary",
              description: job.description || "Full job description available on application.",
              requirements: Array.isArray(job.requirements) ? job.requirements : [],
              posted_date: job.posted_date || new Date().toISOString(),
              deadline: "",
              category: job.category || "General",
              experience_level: job.experience_level || "Mid-Level",
              skills: Array.isArray(job.skills) ? job.skills : [],
              company_logo: job.company_logo || "",
              application_url: job.application_url || job.url || "",
              is_premium: false,
              is_featured: false,
            }
          }),
        )
      }
    }

    // Deduplicate by ID
    const uniqueJobs = Array.from(new Map(allJobs.map((job) => [job.id, job])).values())

    // Sort by date (newest first)
    uniqueJobs.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())

    console.log("[v0] Final jobs count after filtering:", uniqueJobs.length)

    // Apply pagination
    return uniqueJobs.slice(offset, offset + limit)
  } catch (err) {
    console.error("[v0] Unexpected error in fetchJobs:", err)
    return []
  }
}

export async function fetchExternalJobs(): Promise<Job[]> {
  return []
}
