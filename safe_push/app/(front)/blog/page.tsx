"use client"

import { motion } from "motion/react"
import { Calendar, User, ArrowRight, Tag } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  author_name: string
  category: string
  published_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, author_name, category, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })

      if (error) {
        console.error("Error loading posts:", error)
        // Fall back to sample posts if table doesn't exist yet
        setPosts([
          {
            id: "1",
            title: "10 Tips to Ace Your Next Job Interview in Africa",
            slug: "10-tips-ace-job-interview-africa",
            excerpt:
              "Discover the essential strategies that will help you stand out in competitive job interviews across African markets.",
            author_name: "Oscar Williams",
            published_at: new Date().toISOString(),
            category: "Career Tips",
            featured_image: "",
          },
          {
            id: "2",
            title: "How to Write a Resume That Gets You Hired",
            slug: "write-resume-gets-hired",
            excerpt:
              "Learn the art of crafting a compelling resume that catches recruiters' attention and lands you interviews.",
            author_name: "Sarah Johnson",
            published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            category: "Resume Writing",
            featured_image: "",
          },
          {
            id: "3",
            title: "Remote Work Opportunities for African Professionals",
            slug: "remote-work-african-professionals",
            excerpt:
              "Explore the growing landscape of remote work opportunities and how African professionals can tap into the global market.",
            author_name: "David Okonkwo",
            published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            category: "Remote Work",
            featured_image: "",
          },
        ])
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl lg:text-7xl mb-6 text-white font-bold">Career Insights & Tips</h1>

            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Expert advice, industry trends, and success stories to help you advance your career
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400 overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/50 text-6xl font-bold">KN</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={16} className="text-orange-600" />
                      <span className="text-orange-600 text-sm font-medium">{post.category}</span>
                    </div>

                    <h3 className="text-xl mb-3 text-gray-900 font-semibold hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-1 group font-medium"
                      >
                        Read
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
