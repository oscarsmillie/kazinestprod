"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  MousePointerClick,
  Edit2,
  Trash2,
  Copy,
  Star,
  Plus,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  totalPaidUsers: number
  totalJobs: number
  totalResumes: number
  newUsersThisMonth: number
  jobApplications: number
  avgRevenuePerUser: number
  conversionRate: number
}

interface UserData {
  id: string
  email: string
  full_name: string
  created_at: string
  is_active: boolean
  plan_type: string
}

interface PaymentData {
  id: string
  user_email: string
  amount: number
  currency: string
  status: string
  created_at: string
  user_name: string
}

interface JobData {
  id: string
  title: string
  company: string
  status: string
  category: string
  created_at: string
  featured: boolean
}

interface ApplicationData {
  id: string
  job_title: string
  applicant_name: string
  email: string
  created_at: string
}

interface SubscriptionSummary {
  free_users: number
  premium_monthly: number
  premium_yearly: number
  revenue_this_month: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
const ADMIN_EMAIL = "odimaoscar@gmail.com"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalPaidUsers: 0,
    totalJobs: 0,
    totalResumes: 0,
    newUsersThisMonth: 0,
    jobApplications: 0,
    avgRevenuePerUser: 0,
    conversionRate: 0,
  })
  const [users, setUsers] = useState<UserData[]>([])
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [jobs, setJobs] = useState<JobData[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary>({
    free_users: 0,
    premium_monthly: 0,
    premium_yearly: 0,
    revenue_this_month: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [jobsPerWeek, setJobsPerWeek] = useState<any[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push("/dashboard")
      return
    }

    loadDashboardData()

    const channels = [
      supabase
        .channel("admin_users_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
          loadDashboardData()
        })
        .subscribe(),
      supabase
        .channel("admin_payments_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
          loadDashboardData()
        })
        .subscribe(),
      supabase
        .channel("admin_jobs_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "job_postings" }, () => {
          loadDashboardData()
        })
        .subscribe(),
      supabase
        .channel("admin_applications_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "job_applications" }, () => {
          loadDashboardData()
        })
        .subscribe(),
    ]

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [usersRes, jobsRes, resumesRes, paymentsRes, subscriptionsRes, jobApplicationsRes, applicationsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("job_postings").select("*").order("created_at", { ascending: false }),
          supabase.from("resumes").select("id", { count: "exact" }),
          supabase.from("payments").select("*").eq("status", "success").order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("*"),
          supabase.from("job_applications").select("id", { count: "exact" }),
          supabase.from("job_applications").select("*").order("created_at", { ascending: false }).limit(20),
        ])

      // Calculate stats
      const currentMonth = new Date().toISOString().slice(0, 7)
      const newUsers = usersRes.data?.filter((u) => u.created_at?.startsWith(currentMonth)).length || 0
      const activeUsers = usersRes.data?.filter((u) => u.is_active).length || 0
      const paidUsers = new Set(paymentsRes.data?.map((p) => p.user_id) || []).size
      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setStats({
        totalUsers: usersRes.data?.length || 0,
        activeUsers,
        totalRevenue,
        totalPaidUsers: paidUsers,
        totalJobs: jobsRes.data?.length || 0,
        totalResumes: resumesRes.count || 0,
        newUsersThisMonth: newUsers,
        jobApplications: jobApplicationsRes.count || 0,
        avgRevenuePerUser: usersRes.data?.length ? totalRevenue / usersRes.data.length : 0,
        conversionRate: usersRes.data?.length ? (paidUsers / usersRes.data.length) * 100 : 0,
      })

      // User data with subscriptions
      const userDataWithSubs = (usersRes.data || []).slice(0, 50).map((profile) => {
        const userSub = subscriptionsRes.data?.find((s) => s.user_id === profile.id)
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || "Unknown",
          created_at: profile.created_at,
          is_active: profile.is_active ?? true,
          plan_type: userSub?.plan_type || "free",
        }
      })
      setUsers(userDataWithSubs)

      // Jobs data
      const jobsData = (jobsRes.data || []).map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        status: job.status || "active",
        category: job.category || "Other",
        created_at: job.created_at,
        featured: job.featured || false,
      }))
      setJobs(jobsData)

      // Payments data
      const paymentsWithDetails =
        paymentsRes.data?.slice(0, 20).map((p) => ({
          id: p.id,
          user_email: p.user_email || "Unknown",
          amount: p.amount,
          currency: p.currency || "USD",
          status: p.status,
          created_at: p.created_at,
          user_name: p.user_name || "Unknown",
        })) || []
      setPayments(paymentsWithDetails)

      // Applications data
      const applicationsData = (applicationsRes.data || []).map((app) => ({
        id: app.id,
        job_title: app.job_title || "Unknown Job",
        applicant_name: app.applicant_name || "Unknown",
        email: app.email || "N/A",
        created_at: app.created_at,
      }))
      setApplications(applicationsData)

      // Subscription summary
      const freeCount = subscriptionsRes.data?.filter((s) => s.plan_type === "free").length || 0
      const monthlyCount = subscriptionsRes.data?.filter((s) => s.plan_type === "professional_monthly").length || 0
      const yearlyCount = subscriptionsRes.data?.filter((s) => s.plan_type === "professional_yearly").length || 0
      const monthRevenue =
        paymentsRes.data
          ?.filter((p) => p.created_at?.startsWith(currentMonth))
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setSubscriptionSummary({
        free_users: freeCount,
        premium_monthly: monthlyCount,
        premium_yearly: yearlyCount,
        revenue_this_month: monthRevenue,
      })

      // Revenue data
      const revenueByMonth: Record<string, number> = {}
      paymentsRes.data?.forEach((p) => {
        const month = p.created_at?.slice(0, 7) || ""
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (p.amount || 0)
      })

      const last12Months = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthStr = d.toISOString().slice(0, 7)
        last12Months.push({
          month: monthStr,
          revenue: revenueByMonth[monthStr] || 0,
        })
      }
      setRevenueData(last12Months)

      // User growth
      const usersByMonth: Record<string, number> = {}
      usersRes.data?.forEach((u) => {
        const month = u.created_at?.slice(0, 7) || ""
        usersByMonth[month] = (usersByMonth[month] || 0) + 1
      })

      const growthData = []
      let cumulative = 0
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthStr = d.toISOString().slice(0, 7)
        cumulative += usersByMonth[monthStr] || 0
        growthData.push({
          month: monthStr,
          users: cumulative,
        })
      }
      setUserGrowth(growthData)

      // Jobs per week
      const jobsByWeek: Record<string, number> = {}
      jobsRes.data?.forEach((job) => {
        const date = new Date(job.created_at)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekStr = weekStart.toISOString().slice(0, 10)
        jobsByWeek[weekStr] = (jobsByWeek[weekStr] || 0) + 1
      })

      const lastWeeks = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i * 7)
        const weekStr = d.toISOString().slice(0, 10)
        lastWeeks.push({
          week: weekStr,
          jobs: jobsByWeek[weekStr] || 0,
        })
      }
      setJobsPerWeek(lastWeeks)

      // Top paying users
      const userPayments: Record<string, number> = {}
      paymentsRes.data?.forEach((p) => {
        userPayments[p.user_email] = (userPayments[p.user_email] || 0) + p.amount
      })

      const topPayers = Object.entries(userPayments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([email, total]) => ({
          email,
          total: Number.parseFloat(total.toFixed(2)),
        }))
      setTopUsers(topPayers)
    } catch (error) {
      console.error("[v0] Error loading admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (jobId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase.from("job_postings").update({ featured: !currentFeatured }).eq("id", jobId)
      if (error) throw error
      await loadDashboardData()
    } catch (error) {
      console.error("[v0] Error toggling featured:", error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase.from("job_postings").delete().eq("id", jobId)
      if (error) throw error
      await loadDashboardData()
    } catch (error) {
      console.error("[v0] Error deleting job:", error)
    }
  }

  const handleUpgradeUser = async () => {
    if (!selectedUser) return
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ plan_type: "professional" })
        .eq("user_id", selectedUser.id)
      if (error) throw error
      setShowUpgradeDialog(false)
      setSelectedUser(null)
      await loadDashboardData()
    } catch (error) {
      console.error("[v0] Error upgrading user:", error)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", userId)
      if (error) throw error
      await loadDashboardData()
    } catch (error) {
      console.error("[v0] Error deactivating user:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage platform content, users, and monitor business metrics</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.filter((j) => j.status === "active").length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premium Subscribers</CardTitle>
                  <Star className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPaidUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.jobApplications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs Posted Per Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobsPerWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="jobs" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Users Per Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between pb-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div className="text-sm">
                          <p className="font-medium">{p.user_name} upgraded to premium</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">${p.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JOBS TAB */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Job Listings</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Job
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(job.id, job.featured)}
                            >
                              {job.featured ? (
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-bold">User Management</h2>

            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.plan_type === "professional" ? "default" : "outline"}>
                              {u.plan_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.is_active ? "outline" : "secondary"}>
                              {u.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="space-x-2">
                            {u.plan_type !== "professional" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u)
                                  setShowUpgradeDialog(true)
                                }}
                              >
                                Upgrade
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateUser(u.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Deactivate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBSCRIPTIONS TAB */}
          <TabsContent value="subscriptions" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subscriptionSummary.free_users}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Premium Monthly</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subscriptionSummary.premium_monthly}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Premium Yearly</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subscriptionSummary.premium_yearly}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${subscriptionSummary.revenue_this_month.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.user_name}</TableCell>
                          <TableCell className="text-sm">{p.user_email}</TableCell>
                          <TableCell className="font-semibold">${p.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">{p.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APPLICATIONS TAB */}
          <TabsContent value="applications" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.jobApplications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Applications Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {
                      applications.filter((a) => {
                        const today = new Date().toISOString().slice(0, 10)
                        return a.created_at.slice(0, 10) === today
                      }).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalJobs > 0 ? ((stats.jobApplications / (stats.totalJobs * 10)) * 100).toFixed(1) : "0"}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Applicant Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.job_title}</TableCell>
                          <TableCell>{app.applicant_name}</TableCell>
                          <TableCell className="text-sm">{app.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500 bg-transparent">
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-bold">Admin Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Require Login to Apply</p>
                    <p className="text-sm text-muted-foreground">Users must be logged in to apply for jobs</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-expire Jobs</p>
                    <p className="text-sm text-muted-foreground">Automatically expire jobs after 30 days</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Premium Job Postings Only</p>
                    <p className="text-sm text-muted-foreground">Only premium users can post jobs</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Feature Flag - AI Resume Builder</p>
                    <p className="text-sm text-muted-foreground">Enable AI-powered resume generation</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Active Users</p>
                  <p className="font-medium">{stats.activeUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade User to Premium</DialogTitle>
            <DialogDescription>Manually upgrade {selectedUser?.email} to premium subscription</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              User: <span className="font-medium">{selectedUser?.full_name}</span>
            </p>
            <p className="text-sm">
              Email: <span className="font-medium">{selectedUser?.email}</span>
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeUser}>Upgrade User</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
