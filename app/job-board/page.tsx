"use client"

import { Progress } from "@/components/ui/progress"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Briefcase,
  MapPin,
  Calendar,
  Search,
  Building,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  X,
  Globe,
  Flame,
} from "lucide-react"
import { JobApplicationModal } from "@/components/job-application-modal"
import { checkUsageLimit } from "@/lib/access-control"
import { useAuth } from "@/contexts/auth-context"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

function renderHtmlContent(content: string, truncate = false) {
  const hasHtml = /<[^>]+>/g.test(content)

  if (hasHtml) {
    // Strip HTML tags for display in cards
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
  company_logo?: string
  application_url?: string
}

interface UserProfile {
  job_title?: string
  skills?: string[]
  location?: string
  bio?: string
}

// Interface for the structured API response when pagination is used
interface PaginatedJobsResponse {
  jobs: Job[]
  page: number
  total: number
  totalPages: number
  isProfessional: boolean
  pageSize: number
}

// Map filter states to API query parameters
interface JobFilters {
  searchTerm: string
  categoryFilter: string
  typeFilter: string
  experienceFilter: string
  locationFilter: string
  salaryRangeFilter: string
  skillsFilter: string
}

export default function JobBoardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([]) // Holds jobs for the current page
  // We no longer need 'filteredJobs' state since filtering is now done on the server.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Pagination States (fetched from API)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10) // Default, will be updated by API
  const [isProfessional, setIsProfessional] = useState(false)
  const [requiresUpgrade, setRequiresUpgrade] = useState(false)

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [experienceFilter, setExperienceFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [salaryRangeFilter, setSalaryRangeFilter] = useState<string>("all")
  const [skillsFilter, setSkillsFilter] = useState<string>("")

  const [usageData, setUsageData] = useState<{ current: number; limit: number; isPro: boolean } | null>(null)

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [aiRecommendedJobs, setAiRecommendedJobs] = useState<Job[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("job_title, skills, location, bio")
        .eq("id", user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (err) {
      console.error("Error fetching user profile:", err)
    }
  }, [user])

  // NOTE: This recommendation logic now only runs on the current page's jobs!
  const generateAiRecommendations = useCallback(() => {
    if (!userProfile || jobs.length === 0) {
      setAiRecommendedJobs([])
      return
    }

    setLoadingRecommendations(true)

    const profileSkills = userProfile.skills || []
    const profileTitle = userProfile.job_title?.toLowerCase() || ""
    const profileLocation = userProfile.location?.toLowerCase() || ""
    const profileBio = userProfile.bio?.toLowerCase() || ""

    // Score each job based on profile match
    const scoredJobs = jobs.map((job) => {
      let score = 0

      // Match skills (highest weight)
      if (job.skills && profileSkills.length > 0) {
        const jobSkillsLower = job.skills.map((s) => s.toLowerCase())
        const matchedSkills = profileSkills.filter((skill) =>
          jobSkillsLower.some((js) => js.includes(skill.toLowerCase()) || skill.toLowerCase().includes(js)),
        )
        score += matchedSkills.length * 10
      }

      // Match job title
      if (profileTitle && job.title) {
        const titleWords = profileTitle.split(/\s+/)
        titleWords.forEach((word) => {
          if (word.length > 2 && job.title.toLowerCase().includes(word)) {
            score += 8
          }
        })
      }

      // Match location
      if (profileLocation && job.location) {
        if (job.location.toLowerCase().includes(profileLocation) || job.location.toLowerCase() === "remote") {
          score += 5
        }
      }

      // Match category/industry from bio
      if (profileBio && job.category) {
        if (profileBio.includes(job.category.toLowerCase())) {
          score += 3
        }
      }

      // Match description keywords
      if (profileTitle && job.description) {
        const titleWords = profileTitle.split(/\s+/)
        titleWords.forEach((word) => {
          if (word.length > 3 && job.description.toLowerCase().includes(word)) {
            score += 2
          }
        })
      }

      return { job, score }
    })

    // Sort by score and take top matches
    const recommended = scoredJobs
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((item) => item.job)

    setAiRecommendedJobs(recommended)
    setLoadingRecommendations(false)
  }, [userProfile, jobs])

  /**
   * Constructs the URL query string from all filter states.
   * This is the CRITICAL change: all filtering parameters are sent to the server.
   */
  const buildQueryString = (page: number, filters: JobFilters) => {
    const params = new URLSearchParams()
    params.set("page", String(page))

    if (filters.searchTerm) {
      params.set("q", filters.searchTerm)
    }
    if (filters.categoryFilter !== "all") {
      params.set("category", filters.categoryFilter)
    }
    if (filters.typeFilter !== "all") {
      params.set("type", filters.typeFilter)
    }
    if (filters.experienceFilter !== "all") {
      params.set("experience", filters.experienceFilter)
    }
    if (filters.locationFilter !== "all") {
      params.set("location", filters.locationFilter)
    }
    if (filters.salaryRangeFilter !== "all") {
      params.set("salary", filters.salaryRangeFilter)
    }
    if (filters.skillsFilter) {
      params.set("skills", filters.skillsFilter)
    }

    return params.toString()
  }

  const loadJobs = useCallback(
    async (page: number, currentFilters: JobFilters) => {
      try {
        setLoading(true)
        setError(null)
        setRequiresUpgrade(false)

        const queryString = buildQueryString(page, currentFilters)
        
        // CRITICAL FIX: Pass ALL filters and the page number to the API
        const response = await fetch(`/api/jobs?${queryString}`)

        if (response.status === 403) {
          const errorData = await response.json()
          // Handle the access limit for free users
          setError(errorData.error)
          setRequiresUpgrade(errorData.requiresUpgrade)
          setJobs([])
          // IMPORTANT: Update totalPages to the limit page to disable further navigation
          setTotalPages(page) 
          setTotalJobs(page * (errorData.pageSize || 10)) // Set total for display purposes
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const jobsResponse: PaginatedJobsResponse = await response.json()

        // Update states with server response
        setJobs(jobsResponse.jobs) // Jobs for the current page
        setTotalJobs(jobsResponse.total)
        setTotalPages(jobsResponse.totalPages)
        setIsProfessional(jobsResponse.isProfessional)
        setPageSize(jobsResponse.pageSize)
        setCurrentPage(jobsResponse.page)

        if (user) {
          const usageCheck = await checkUsageLimit(user.id, "ats_checks")
          setUsageData({
            current: usageCheck.current,
            limit: usageCheck.limit,
            isPro: usageCheck.planType === "professional",
          })
        }
      } catch (err) {
        console.error("Error fetching jobs:", err)
        setError("Failed to load jobs. Please try again later.")
      } finally {
        setLoading(false)
      }
    },
    [user],
  ) // loadJobs depends on user for the usage check

  // Initial load and whenever the page changes
  useEffect(() => {
    // Collect current filter states
    const currentFilters: JobFilters = {
      searchTerm,
      categoryFilter,
      typeFilter,
      experienceFilter,
      locationFilter,
      salaryRangeFilter,
      skillsFilter,
    }
    loadJobs(currentPage, currentFilters)
  }, [
    loadJobs,
    currentPage,
    // Add all filters to the dependency array so that changing a filter triggers a reload of page 1
    searchTerm,
    categoryFilter,
    typeFilter,
    experienceFilter,
    locationFilter,
    salaryRangeFilter,
    skillsFilter,
  ]) 


  // Fetch profile once
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Generate recommendations whenever the jobs list changes (i.e., new page is loaded)
  useEffect(() => {
    generateAiRecommendations()
  }, [generateAiRecommendations])

  // *** REMOVED: The old client-side applyFilters useEffect hook is no longer needed ***

  // *** REMOVED: The old client-side applyFilters function is no longer needed ***

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    // When any filter changes, reset to page 1 to reload the filtered results from the server
    setter(value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Trigger the useEffect hook by setting the current page to 1 (or just triggering a change)
    // If the searchTerm state changes, the main useEffect already handles the reload,
    // so we only need to force a reset to page 1 if not already there.
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      // Force a reload if already on page 1 and the search term hasn't changed (though it should have)
      const currentFilters: JobFilters = {
        searchTerm,
        categoryFilter,
        typeFilter,
        experienceFilter,
        locationFilter,
        salaryRangeFilter,
        skillsFilter,
      }
      loadJobs(currentPage, currentFilters)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setTypeFilter("all")
    setExperienceFilter("all")
    setLocationFilter("all")
    setSalaryRangeFilter("all")
    setSkillsFilter("")
    // Resetting filters should trigger a reload of page 1 with no filters
    setCurrentPage(1) 
  }

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
      // Only change page if not loading and the page is valid
      if (!loading && newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage)
      }
  }

  const openJobDetails = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // These functions now reflect the options present on the *current* page's jobs.
  // For production, you'd likely fetch *all* possible filter options from a separate endpoint or config.
  const getJobCategories = () => {
    const categories = new Set(jobs.map((job) => job.category).filter(Boolean))
    return Array.from(categories).sort()
  }

  const getJobTypes = () => {
    const types = new Set(jobs.map((job) => job.type).filter(Boolean))
    return Array.from(types).sort()
  }

  const getExperienceLevels = () => {
    const levels = new Set(jobs.map((job) => job.experience_level).filter(Boolean))
    return Array.from(levels).sort()
  }

  const getLocations = () => {
    const locations = new Set(jobs.map((job) => job.location).filter((loc) => loc && loc !== "Remote"))
    const locArray = Array.from(locations).sort()
    return locArray.length > 0 ? ["Remote", ...locArray] : ["Remote"]
  }

  // Jobs to display are simply the jobs fetched for the current page (no client-side filtering)
  const currentJobs = jobs

  const currentDisplayStart = totalJobs > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const currentDisplayEnd = totalJobs > 0 ? Math.min(currentPage * pageSize, totalJobs) : 0


  if (loading && jobs.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto p-4">
          <Card className="max-w-md mx-auto mt-20 border-red-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                  <X className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{requiresUpgrade ? "Access Restricted" : "Unable to Load Jobs"}</h3>
                <p className="text-red-600 mb-6">{error}</p>
                {requiresUpgrade && (
                  <Button onClick={() => router.push("/upgrade")} className="bg-orange-600 hover:bg-orange-700">
                    Upgrade to Premium
                  </Button>
                )}
                {!requiresUpgrade && (
                  <Button onClick={() => handleFilterChange(() => {}, "all")} className="bg-blue-600 hover:bg-blue-700">
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const JobCard = ({ job, featured = false }: { job: Job; featured?: boolean }) => (
    <Card
      className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
        featured
          ? "border-orange-200 bg-gradient-to-r from-orange-50 to-white"
          : "border-gray-100 hover:border-blue-300 bg-white"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {featured && (
                  <div className="flex items-center gap-1 mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600 uppercase">AI Recommended</span>
                  </div>
                )}
                <h3
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-1"
                  onClick={() => openJobDetails(job)}
                >
                  {job.title}
                </h3>
                <div className="flex items-center text-gray-700 font-medium">
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  {job.company}
                </div>
              </div>
              {job.company_logo && (
                <img
                  src={job.company_logo || "/placeholder.svg"}
                  alt={job.company}
                  className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-2 border-2 border-gray-200 hidden md:block"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mt-4 mb-4">
              <div className="flex items-center font-medium">
                <MapPin className="h-4 w-4 mr-1.5 text-blue-500" />
                {job.location}
              </div>
              <div className="flex items-center font-medium">
                <Briefcase className="h-4 w-4 mr-1.5 text-green-500" />
                {job.type}
              </div>
              <div className="flex items-center font-medium text-green-700">
                <DollarSign className="h-4 w-4 mr-1.5" />
                {job.salary}
              </div>
              <div className="flex items-center font-medium">
                <Calendar className="h-4 w-4 mr-1.5 text-purple-500" />
                {formatDate(job.posted_date)}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                {renderHtmlContent(job.description, true)}
              </p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    +{job.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t-2 border-gray-100 flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-3 py-1 border-2 border-purple-200 text-purple-700 bg-purple-50"
          >
            {job.experience_level}
          </Badge>
          <Button
            onClick={() => openJobDetails(job)}
            size="sm"
            className="px-6 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">African Job Board</h1>
              <p className="text-gray-600 mt-1">Discover {totalJobs}+ curated opportunities across Africa</p>
            </div>
          </div>

          {usageData && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-sm max-w-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-blue-700" />
                  <span className="text-sm font-medium text-blue-900">
                    Applications Tracked:{" "}
                    <span className="font-bold text-blue-700">
                      {usageData.current}/{usageData.limit === -1 ? "Unlimited" : usageData.limit}
                    </span>
                  </span>
                </div>
                {usageData.limit !== -1 && usageData.current >= usageData.limit && !usageData.isPro && (
                  <Badge variant="destructive" className="text-xs">
                    Limit Reached
                  </Badge>
                )}
              </div>
              {usageData.limit !== -1 && (
                <Progress value={(usageData.current / usageData.limit) * 100} className="h-2" />
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-4 shadow-lg border-2 border-gray-100">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center font-bold text-gray-900">
                    <Filter className="h-5 w-5 mr-2 text-blue-600" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 px-3 text-xs font-medium hover:bg-white"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Search</Label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Job title, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 border-2 focus:border-blue-500"
                    />
                    <button type="submit" hidden aria-hidden="true"></button>
                  </form>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Location
                  </Label>
                  <Select value={locationFilter} onValueChange={(val) => handleFilterChange(setLocationFilter, val)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
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
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</Label>
                  <Select value={categoryFilter} onValueChange={(val) => handleFilterChange(setCategoryFilter, val)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
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
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Job Type</Label>
                  <Select value={typeFilter} onValueChange={(val) => handleFilterChange(setTypeFilter, val)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
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
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Experience</Label>
                  <Select value={experienceFilter} onValueChange={(val) => handleFilterChange(setExperienceFilter, val)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
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
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Salary Range
                  </Label>
                  <Select value={salaryRangeFilter} onValueChange={(val) => handleFilterChange(setSalaryRangeFilter, val)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
                      <SelectValue placeholder="Any Salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Salary</SelectItem>
                      <SelectItem value="0-50k">$0 - $50k</SelectItem>
                      <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                      <SelectItem value="100k-150k">$100k - $150k</SelectItem>
                      <SelectItem value="150k+">$150k+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Skills */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Skills</Label>
                  <Input
                    placeholder="e.g., React, Python..."
                    value={skillsFilter}
                    // IMPORTANT: Setting skills filter should also trigger a page reset to 1
                    onChange={(e) => handleFilterChange(setSkillsFilter, e.target.value)} 
                    className="border-2 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <TabsList className="bg-white border-2 border-gray-200 shadow-sm">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All Jobs ({totalJobs})
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai-recommended"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    AI For You ({aiRecommendedJobs.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Recent
                  </TabsTrigger>
                  <TabsTrigger
                    value="featured"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Featured
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border-2 border-gray-200 shadow-sm">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium">
                    Showing {currentDisplayStart}-{Math.min(currentDisplayEnd, totalJobs)} of {totalJobs}
                  </span>
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                {currentJobs.length === 0 && !loading ? (
                  <div className="text-center p-10 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">No Jobs Found</h3>
                    <p className="text-gray-600 mt-2">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <>
                    {/* Render All Jobs */}
                    {currentJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-4 mt-8">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loading}
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="ai-recommended" className="space-y-4">
                {loadingRecommendations ? (
                  <div className="text-center p-10 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Generating recommendations...</p>
                  </div>
                ) : aiRecommendedJobs.length === 0 ? (
                  <div className="text-center p-10 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <Flame className="h-10 w-10 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">No AI Recommendations Found</h3>
                    <p className="text-gray-600 mt-2">
                      Please ensure your profile is complete with **skills** and **job title** to get personalized matches.
                    </p>
                  </div>
                ) : (
                  aiRecommendedJobs.map((job) => (
                    <JobCard key={job.id} job={job} featured={true} />
                  ))
                )}
              </TabsContent>

              {/* Add empty content for other tabs */}
              <TabsContent value="recent" className="space-y-4">
                 <div className="text-center p-10 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Tab Content Not Implemented</h3>
                    <p className="text-gray-600 mt-2">This tab will show recently added jobs.</p>
                  </div>
              </TabsContent>

              <TabsContent value="featured" className="space-y-4">
                 <div className="text-center p-10 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Tab Content Not Implemented</h3>
                    <p className="text-gray-600 mt-2">This tab will show featured jobs.</p>
                  </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <JobApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
          usageData={usageData}
          onSuccessfulApplication={() => {
            // Logic to update usage data if needed
            if (usageData) {
              setUsageData({ ...usageData, current: usageData.current + 1 })
            }
          }}
        />
      </div>
    </div>
  )
}
