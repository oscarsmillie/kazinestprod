"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  AlertCircle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobApplicationModal } from "@/components/job-application-modal"
import { checkUsageLimit } from "@/lib/access-control"
import { useAuth } from "@/contexts/auth-context"
import { Label } from "@/components/ui/label"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { JOB_BOARD_CONFIG, parseJobTitle } from "@/lib/job-board-utils"

// --- Interface and Constants ---

interface Job {
  id: string
  title: string
  company?: string
  location?: string
  salary_min?: number
  salary_max?: number
  job_type?: string
  experience_level?: string
  description?: string
  requirements?: string[]
  benefits?: string[]
  posted_date?: string
  application_url?: string
  company_logo?: string
  category?: string
  skills?: string[]
  responsibilities?: string[]
  source?: string
}

// NOTE: This value must match the backend API's default page size for free users (and the fallback)
const JOBS_PER_PAGE = 10

// --- Main Component ---

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pageLimit, setPageLimit] = useState<number | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  // State variable to hold the total number of jobs available across all pages
  const [totalJobsCount, setTotalJobsCount] = useState(0)
  // State to track the actual page size used (server-driven, defaults to client constant)
  const [currentJobsPerPage, setCurrentJobsPerPage] = useState(JOBS_PER_PAGE)
  // State to force a filter change when the user filters, so useEffect below can trigger
  const [filterKey, setFilterKey] = useState(0)


  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [salaryFilter, setSalaryFilter] = useState("all")
  const [skillsFilter, setSkillsFilter] = useState<string[]>([])

  const { user, userType } = useAuth()
  // CRITICAL FIX: Safely extract user ID using optional chaining.
  // This makes the dependency array track a string/undefined, not the whole unstable user object.
  const userId = user?.id;
  
  const [proAccess, setProAccess] = useState(false)
  
  const [usageData, setUsageData] = useState<any>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // maxAvailablePages calculation now uses currentJobsPerPage (which is updated by API response)
  const maxAvailablePages = totalJobsCount > 0
    ? Math.ceil(totalJobsCount / currentJobsPerPage)
    : 1

  // --- Utility Functions ---

  const getLocations = useCallback(() => {
    const locations = new Set<string>()
    jobs.forEach((job) => {
      if (job.location) locations.add(job.location)
    })
    return Array.from(locations).sort()
  }, [jobs])

  const getJobCategories = useCallback(() => {
    const categories = new Set<string>()
    jobs.forEach((job) => {
      if (job.category) categories.add(job.category)
    })
    return Array.from(categories).sort()
  }, [jobs])

  const getJobTypes = useCallback(() => {
    const types = new Set<string>()
    jobs.forEach((job) => {
      if (job.job_type) types.add(job.job_type)
    })
    return Array.from(types).sort()
  }, [jobs])

  const getExperienceLevels = useCallback(() => {
    const levels = new Set<string>()
    jobs.forEach((job) => {
      if (job.experience_level) levels.add(job.experience_level)
    })
    return Array.from(levels).sort()
  }, [jobs])

  const resetFilters = () => {
    setSearchTerm("")
    setLocationFilter("all")
    setCategoryFilter("all")
    setTypeFilter("all")
    setExperienceFilter("all")
    setSalaryFilter("all")
    setSkillsFilter([])
    setCurrentPage(1) // Reset page on filter reset
    setFilterKey(prev => prev + 1); // Trigger the filter effect
  }

  const openJobDetails = (job: Job) => {
    if (!job || !job.id) {
      console.warn("Invalid job passed to openJobDetails", job)
      return
    }
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max)
      return `$${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()}`
    if (job.salary_min) {
      return `$${job.salary_min.toLocaleString()}+`
    }
    return "Salary not specified"
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Recently posted"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)} weeks ago`
  }

  function renderHtmlContent(content: string | undefined, truncate = false) {
    if (!content) return ""

    const hasHtml = /<[^>]+>/g.test(content)

    if (hasHtml) {
      const strippedContent = content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (truncate) {
        return strippedContent.length > 150 ? strippedContent.substring(0, 150) + "..." : strippedContent
      }
      return strippedContent
    }

    if (truncate) {
      return content.length > 150 ? content.substring(0, 150) + "..." : content
    }
    return content
  }

  const getCompanyLogo = (job: Job) => {
    if (job.company_logo) {
      return job.company_logo
    }
    const { company } = parseJobTitle(job.title || "")
    if (!company) return "/placeholder.svg"
    return `/placeholder.svg?query=${encodeURIComponent(company + " logo")}`
  }

  // --- Job Loading and Pagination Logic ---

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setShowUpgradePrompt(false) // Hide prompt on new load

    // The logic to reset currentPage is now in the filter useEffect below,
    // so we just rely on the current value of currentPage here.

    // Add filter parameters to the API request to enable server-side filtering
    const params = new URLSearchParams({
      page: currentPage.toString(),
      searchTerm,
      locationFilter: locationFilter === 'all' ? '' : locationFilter,
      categoryFilter: categoryFilter === 'all' ? '' : categoryFilter,
      typeFilter: typeFilter === 'all' ? '' : typeFilter,
      experienceFilter: experienceFilter === 'all' ? '' : experienceFilter,
      salaryFilter: salaryFilter === 'all' ? '' : salaryFilter,
      skillsFilter: skillsFilter.join(','),
      proAccess: proAccess.toString(),
    })

    try {
      const logUserType = proAccess ? "professional/trial" : "free";
      console.log(`[v1] Fetching jobs - Page: ${currentPage}, User type: ${logUserType}`)

      // Pass filters to the server
      const response = await fetch(`/api/jobs?${params.toString()}`)

      if (response.status === 403) {
        const data = await response.json()
        setPageLimit(data.pageLimit)
        setShowUpgradePrompt(true)
        setJobs([]) // Clear jobs if limit is hit
        // Set count to the total filtered jobs returned from the server's error response
        setTotalJobsCount(data.totalCount || 0)
        setCurrentJobsPerPage(data.pageSize || JOBS_PER_PAGE)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()
      
      console.log(`[v1] Jobs fetched: ${data.jobs?.length || 0}, Total available: ${data.totalCount || 0}`)
      
      setJobs(data.jobs || [])
      // FIX: Store the total number of jobs and the current page size returned by the API
      setTotalJobsCount(data.totalCount || 0) 
      setCurrentJobsPerPage(data.pageSize || JOBS_PER_PAGE)
      
    } catch (error) {
      console.error("[v1] Error loading jobs:", error)
      setJobs([])
      setTotalJobsCount(0)
      setCurrentJobsPerPage(JOBS_PER_PAGE)
    } finally {
      setLoading(false)
    }
  }, [currentPage, proAccess, searchTerm, locationFilter, categoryFilter, typeFilter, experienceFilter, salaryFilter, skillsFilter]) // Updated dependencies

  const goToNextPage = () => {
    if (currentPage < maxAvailablePages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }
  
  // Added a function to handle page selection from a list (or direct input)
  const setPage = (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= maxAvailablePages) {
          setCurrentPage(pageNumber);
      }
  }


  // --- Effects ---

  // Effect to reset to page 1 ONLY when filters change, and use a key to track filter changes
  useEffect(() => {
    // This effect runs whenever a filter or search term changes
    // It resets the page to 1 and triggers a new data fetch via the second useEffect.
    setCurrentPage(1); 
  }, [searchTerm, locationFilter, categoryFilter, typeFilter, experienceFilter, salaryFilter, skillsFilter, filterKey]);


  // Effect to load jobs when pagination or the 'reset to 1' from above effect changes currentPage
  useEffect(() => {
    // Before loading, check if the current page is out of bounds due to filtering reducing totalCount.
    if (currentPage > maxAvailablePages && totalJobsCount > 0) {
        setCurrentPage(1);
    } else {
        loadJobs()
    }
  // Added totalJobsCount to dependencies to handle the case where a filter reduces the maxAvailablePages
  }, [loadJobs, currentPage, totalJobsCount, maxAvailablePages]) 

  // CRITICAL FIX: The usage data fetch is now dependent on the safe 'userId' variable.
  useEffect(() => {
    const fetchUsage = async () => {
      // ✅ Check if 'userId' is a truthy value (i.e., not undefined, null, or empty string)
      if (userId) { 
        const data = await checkUsageLimit(userId, "ats_checks") 
        setUsageData(data)
      }
    }
    fetchUsage()
  }, [userId]) // ✅ Depend only on the primitive string 'userId'

  // Fetch subscription status to determine pro access
  useEffect(() => {
    const fetchSub = async () => {
      if (userId) {
        try {
          const response = await fetch('/api/subscription')
          if (response.ok) {
            const data = await response.json()
            const type = data.plan_type
            setProAccess(type === 'professional' || type === 'trial')
          }
        } catch (error) {
          console.error("Error fetching subscription:", error)
        }
      } else {
        setProAccess(false)
      }
    }
    fetchSub()
  }, [userId])

  
  const displayedJobs = jobs; 

  const paginationInfo = {
    start: totalJobsCount === 0 ? 0 : (currentPage - 1) * currentJobsPerPage + 1,
    end: Math.min(currentPage * currentJobsPerPage, totalJobsCount),
    total: totalJobsCount,
  }

  // --- Render ---

  if (loading && totalJobsCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading African opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {userType === "trial" && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto p-3 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Trial User
                </Badge>
                <span className="text-sm text-blue-700">
                  You have unlimited job board access on your 7-day trial. Resumes are limited to 1 watermarked
                  download.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showUpgradePrompt && (
        <UpgradePrompt
          title="Premium Access Required"
          description={`Free users can access only ${pageLimit} pages of our job board. Upgrade to premium for unlimited access to all opportunities.`}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Board</h1>
              <p className="text-gray-600">
                Discover opportunities tailored for African professionals
              </p>
            </div>
          </div>
          {usageData && (
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm max-w-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-3.5 w-3.5 text-blue-700" />
                  <span className="text-xs font-medium text-blue-900">
                    Applications Tracked:{" "}
                    <span className="font-bold text-blue-700">
                      {usageData.current}/{usageData.limit === -1 ? "Unlimited" : usageData.limit}
                    </span>
                  </span>
                </div>
                {usageData.limit !== -1 && usageData.current >= usageData.limit && !usageData.isPro && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                    Limit Reached
                  </Badge>
                )}
              </div>
              {usageData.limit !== -1 && (
                <Progress value={(usageData.current / usageData.limit) * 100} className="h-1.5" />
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-4 shadow-md border border-gray-200">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center font-bold text-gray-900">
                    <Filter className="h-4 w-4 mr-1.5 text-blue-600" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-7 px-2 text-xs font-medium hover:bg-white"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 pb-3 px-4">
                {/* Search */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Job title, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm border focus:border-blue-500"
                    />
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Location
                  </Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {getLocations().map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getJobCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Job Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {getJobTypes().map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Experience</Label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {getExperienceLevels().map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Salary Range
                  </Label>
                  <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="Any Salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Salary</SelectItem>
                      <SelectItem value="0">Below $50k</SelectItem>
                      <SelectItem value="50000">$50k - $100k</SelectItem>
                      <SelectItem value="100000">$100k - $150k</SelectItem>
                      <SelectItem value="150000">$150k+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-2" />

                {/* Skills */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Skills</Label>
                  <Select
                    value={skillsFilter[0] || "all"}
                    onValueChange={(value) => setSkillsFilter(value === "all" ? [] : [value])}
                  >
                    <SelectTrigger className="h-8 text-sm border focus:border-blue-500">
                      <SelectValue placeholder="Select skills..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <TabsList className="bg-white border border-gray-200 shadow-sm h-9">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-3"
                  >
                    All Jobs ({totalJobsCount}) 
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-3"
                  >
                    Recent
                  </TabsTrigger>
                  <TabsTrigger
                    value="featured"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-3"
                  >
                    Featured
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    Showing {paginationInfo.start}-
                    {paginationInfo.end} of {paginationInfo.total}
                  </span>
                </div>
              </div>

              <TabsContent value="all" className="space-y-3">
                {displayedJobs.length === 0 && !loading ? (
                  <Card className="border-2 border-dashed border-gray-300 shadow-lg">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="mx-auto h-12 w-12 text-gray-300 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                        We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                      </p>
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        size="sm"
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {displayedJobs.map((job) => (
                      <Card
                        key={job.id}
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 bg-white"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3
                                    className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-0.5"
                                    onClick={() => openJobDetails(job)}
                                  >
                                    {parseJobTitle(job.title || "").title}
                                  </h3>
                                  <div className="flex items-center text-sm text-gray-700 font-medium">
                                    <Building className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                    <span>{job.company || parseJobTitle(job.title || "").company}</span>
                                  </div>
                                </div>
                                {getCompanyLogo(job) && (
                                  <img
                                    src={getCompanyLogo(job) || "/placeholder.svg"}
                                    alt={parseJobTitle(job.title || "").company}
                                    className="w-11 h-11 rounded-lg object-contain bg-gray-50 p-1.5 border border-gray-200 hidden md:block"
                                  />
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 mt-3 mb-2.5">
                                <div className="flex items-center font-medium">
                                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  {job.location || "Location not specified"}
                                </div>
                                <div className="flex items-center font-medium">
                                  <Briefcase className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  {job.job_type || "Job type not specified"}
                                </div>
                                {job.salary_min && (
                                  <div className="flex items-center font-medium text-green-700">
                                    <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                                    {formatSalary(job)}
                                  </div>
                                )}
                                <div className="flex items-center font-medium">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                                  {formatDate(job.posted_date)}
                                </div>
                              </div>

                              <div className="mt-2.5">
                                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                  {renderHtmlContent(job.description, true)}
                                </p>
                              </div>

                              {job.skills && job.skills.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {job.skills.slice(0, 5).map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0.5 font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {job.skills.length > 5 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0.5 font-medium bg-gray-100 text-gray-600 border border-gray-200"
                                    >
                                      +{job.skills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold px-2 py-0.5 border border-purple-200 text-purple-700 bg-purple-50"
                            >
                              {job.experience_level || "Experience level not specified"}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => openJobDetails(job)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold px-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                View Details
                              </Button>
                              {job.application_url && (
                                <Button
                                  asChild
                                  size="sm"
                                  className="h-8 text-xs font-semibold px-3 bg-blue-600 hover:bg-blue-700"
                                >
                                  <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                                    Apply Now
                                    <ExternalLink className="h-3 w-3 ml-1.5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Pagination Controls (Completed) */}
            {totalJobsCount > 0 && (
                <div className="mt-8 flex justify-center items-center space-x-4">
                    <Button 
                        onClick={goToPrevPage}
                        disabled={currentPage === 1 || loading}
                        variant="outline"
                        size="icon"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page Number Display/Input */}
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <span>Page</span>
                        <Input
                            type="number"
                            min={1}
                            max={maxAvailablePages}
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value);
                                // Allow typing but only set if it's a valid number for a moment
                                if (!isNaN(page) && page > 0 && page <= maxAvailablePages) {
                                    setCurrentPage(page);
                                }
                            }}
                            onBlur={(e) => {
                                // On blur, if the value is invalid, reset to the current actual page
                                const page = parseInt(e.target.value);
                                if (isNaN(page) || page < 1 || page > maxAvailablePages) {
                                    setCurrentPage(currentPage);
                                } else {
                                    setPage(page);
                                }
                            }}
                            className="w-16 h-8 text-center text-sm border focus:border-blue-500"
                        />
                        <span>of {maxAvailablePages}</span>
                    </div>

                    <Button 
                        onClick={goToNextPage}
                        disabled={currentPage >= maxAvailablePages || loading}
                        variant="outline"
                        size="icon"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
      {/* Only render modal if we have a valid job */}
      {selectedJob && selectedJob.id && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedJob(null) // Clear selection when closed
          }}
        />
      )}
    </div>
  )
}
