import { supabaseAdmin } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { hasProfessionalAccess } from "@/lib/access-control"
import { JOB_BOARD_CONFIG } from "@/lib/job-board-utils"

export const dynamic = "force-dynamic"

// Define a common interface for job data from both tables
interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  type: string | null
  salary: string | null
  job_type: string | null
  salary_min?: number | null
  salary_max?: number | null
  description: string | null
  requirements: string[] | null
  posted_date: string | null
  deadline: string | null
  category: string | null
  experience_level: string | null
  skills: string[] | null
  company_logo?: string | null
  application_url?: string | null
  [key: string]: any | undefined
}

// Helper function to fetch all required filter options from the database
async function fetchFilterOptions() {
  const [
    { data: categoriesData },
    { data: typesData },
    { data: levelsData },
    { data: locationsData }
  ] = await Promise.all([
    supabaseAdmin.from("job_postings").select("category", { count: 'exact' }).is("deleted_at", null),
    supabaseAdmin.from("job_postings").select("type", { count: 'exact' }).is("deleted_at", null),
    supabaseAdmin.from("job_postings").select("experience_level", { count: 'exact' }).is("deleted_at", null),
    supabaseAdmin.from("job_postings").select("location", { count: 'exact' }).is("deleted_at", null),
  ])

  // Use a Set for deduplication and filter out nulls/empty strings, then sort.
  const categories = Array.from(new Set(categoriesData?.map(d => d.category).filter(Boolean) as string[] || [])).sort();
  const types = Array.from(new Set(typesData?.map(d => d.type).filter(Boolean) as string[] || [])).sort();
  const experienceLevels = Array.from(new Set(levelsData?.map(d => d.experience_level).filter(Boolean) as string[] || [])).sort();

  // Add 'Remote' and clean up locations
  const locations = Array.from(new Set(locationsData?.map(d => d.location).filter(Boolean) as string[] || []));
  const finalLocations = Array.from(new Set(["Remote", ...locations.filter(loc => loc.toLowerCase() !== 'remote')])).sort();

  return { categories, types, experienceLevels, locations: finalLocations };
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // --- 1. Get Filters from Query Params ---
    const page = Number.parseInt(searchParams.get("page") || "1")
    const searchTerm = searchParams.get("searchTerm")?.toLowerCase()
    const categoryFilter = searchParams.get("categoryFilter")
    const typeFilter = searchParams.get("typeFilter")
    const experienceFilter = searchParams.get("experienceFilter")
    const locationFilter = searchParams.get("locationFilter")
    const salaryFilter = searchParams.get("salaryFilter")
    const skillsFilter = searchParams.get("skillsFilter")?.toLowerCase()

    // FIX: Get the proAccess flag sent by the client
    const proAccessFlag = searchParams.get("proAccess") === 'true';


    // --- 2. Fetch All Jobs (Internal and External) ---
    // NOTE: For performance, ideally this query should be optimized to only fetch relevant fields or use RLS/views.
    const [{ data: internalJobs }, { data: externalJobs }] = await Promise.all([
      supabaseAdmin.from("job_postings").select("*").is("deleted_at", null),
      supabaseAdmin.from("external_jobs").select("*"),
    ])

    // Combine, deduplicate, and clean up jobs
    const allJobs: Job[] = [
      ...(internalJobs || []),
      ...(externalJobs || []).filter(
        (externalJob: any) => !(internalJobs || []).some((internal: any) => internal.id === externalJob.id),
      ) as Job[],
    ].map(job => ({ 
      ...job, 
      skills: Array.isArray(job.skills) ? job.skills : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      job_type: job.job_type || job.type || null, 
    }))


    // --- 3. Get User Access Level (FIXED) ---
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

    const { data: { user } } = await supabase.auth.getUser()

    let isPremium = false;
    if (user) {
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .single();

      const planType = sub?.plan_type || 'free';
      isPremium = planType === 'professional' || planType === 'trial';
    }

    // CRITICAL FIX: Use the client's 'proAccess' flag as an OR condition.
    // This bypasses the page limit check if the client already knows the user is premium/trial.
    isPremium = isPremium || proAccessFlag; 


    // --- 4. Apply Server-Side Filtering ---
    let filteredJobs = allJobs.filter(job => {
      let matches = true;

      // Search Term Filter (searchTerm)
      if (searchTerm) {
        const termMatch =
          job.title?.toLowerCase().includes(searchTerm) ||
          job.company?.toLowerCase().includes(searchTerm) ||
          job.description?.toLowerCase().includes(searchTerm) ||
          (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
        if (!termMatch) matches = false;
      }

      // Category Filter
      if (matches && categoryFilter && categoryFilter !== "all") {
        if (job.category?.toLowerCase() !== categoryFilter.toLowerCase()) matches = false;
      }

      // Type Filter
      if (matches && typeFilter && typeFilter !== "all") {
        if (job.job_type?.toLowerCase() !== typeFilter.toLowerCase()) matches = false;
      }

      // Experience Filter
      if (matches && experienceFilter && experienceFilter !== "all") {
        if (job.experience_level?.toLowerCase() !== experienceFilter.toLowerCase()) matches = false;
      }

      // Location Filter
      if (matches && locationFilter && locationFilter !== "all") {
        const jobLocation = job.location?.toLowerCase() || '';
        const filterLocation = locationFilter.toLowerCase();

        const locationMatch =
          jobLocation.includes(filterLocation) ||
          (filterLocation === "remote" && jobLocation === "remote")

        if (!locationMatch) matches = false;
      }

      // Skills Filter
      if (matches && skillsFilter) {
        const skillList = skillsFilter.split(',').map(s => s.trim());
        if (skillList.length > 0) {
            const skillMatch = job.skills && Array.isArray(job.skills) && skillList.every(requiredSkill => 
                job.skills!.some(jobSkill => jobSkill?.toLowerCase().includes(requiredSkill))
            );
            if (!skillMatch) matches = false;
        }
      }

      // Salary Range Filter
      if (matches && salaryFilter && salaryFilter !== "all") {
          const minFilter = Number.parseInt(salaryFilter);

          if (!job.salary_min) {
              matches = false; 
          } else if (minFilter === 0) {
              matches = job.salary_min < 50000;
          } else if (minFilter === 150000) {
              matches = job.salary_min >= 150000;
          } else if (minFilter === 50000) {
              matches = job.salary_min >= 50000 && job.salary_min < 100000;
          } else if (minFilter === 100000) {
              matches = job.salary_min >= 100000 && job.salary_min < 150000;
          } else {
              matches = false;
          }
      }

      return matches
    })

    const totalFilteredJobs = filteredJobs.length;

    // --- 5. Access Control Check and Conditional Pagination Setup ---
    // Constants from job-board-utils.ts (e.g., 5 pages, 10 jobs/page)
    const FREE_USERS_PAGES = JOB_BOARD_CONFIG.FREE_USERS_PAGES; 
    const FREE_JOBS_PER_PAGE = JOB_BOARD_CONFIG.JOBS_PER_PAGE; 
    
    // Custom settings for Professional Users (as requested)
    const PRO_JOBS_PER_PAGE = 15; 
    const PRO_USERS_PAGES = 1000; 

    // Determine the Jobs Per Page and the maximum allowed Page number
    const JOBS_PER_PAGE = isPremium ? PRO_JOBS_PER_PAGE : FREE_JOBS_PER_PAGE;
    const PAGE_LIMIT = isPremium ? PRO_USERS_PAGES : FREE_USERS_PAGES;

    const totalPages = Math.ceil(totalFilteredJobs / JOBS_PER_PAGE);

    // Check if the requested page exceeds the user's limit (Paywall check)
    if (!isPremium && page > PAGE_LIMIT) {
      return Response.json(
        {
          error: `Access limited. Only the first ${FREE_USERS_PAGES} pages are available for free users. Upgrade for unlimited access.`,
          pageLimit: PAGE_LIMIT,
          requiresUpgrade: true, // Always true if blocked
          pageSize: JOBS_PER_PAGE,
          totalCount: totalFilteredJobs, 
          totalPages: totalPages
        },
        { status: 403 },
      )
    }

    console.log(
      "[v2] Jobs API: Page",
      page,
      "| Filtered jobs:",
      totalFilteredJobs,
      "| User:",
      isPremium ? "Premium" : "Free",
      "| Page Size:",
      JOBS_PER_PAGE
    )

    // --- 6. Apply Pagination ---
    const startIndex = (page - 1) * JOBS_PER_PAGE
    const endIndex = startIndex + JOBS_PER_PAGE
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    // --- 7. Fetch Filter Options for the Client Dropdowns ---
    const filterOptions = await fetchFilterOptions();


    return Response.json({
      jobs: paginatedJobs,
      page,
      totalCount: totalFilteredJobs, 
      totalPages: totalPages,
      isPremium,
      pageSize: JOBS_PER_PAGE,
      categories: filterOptions.categories,
      types: filterOptions.types,
      experienceLevels: filterOptions.experienceLevels,
      locations: filterOptions.locations,
    })
  } catch (error) {
    console.error("[v2] Jobs API Error:", error)
    return Response.json({
      error: "Failed to fetch jobs. Please try again.",
      jobs: [],
      totalCount: 0, 
      categories: [], types: [], experienceLevels: [], locations: []
    }, { status: 500 })
  }
}
