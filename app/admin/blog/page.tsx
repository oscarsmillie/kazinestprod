"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabaseAdmin } from "@/lib/supabase"
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  author_name: string
  category: string
  is_published: boolean
  is_featured: boolean
  view_count: number
  created_at: string
  published_at: string
}

const ADMIN_EMAIL = "odimaoscar@gmail.com"
const CATEGORIES = ["Career Tips", "Resume Writing", "Remote Work", "Interview Prep", "Job Search", "Industry Insights"]

export default function AdminBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author_name: "KaziNest Team",
    category: "Career Tips",
    is_published: false,
    is_featured: false,
  })

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push("/dashboard")
      return
    }
    loadPosts()
  }, [user, router])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error loading blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    })
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("Title and content are required")
      return
    }

    try {
      setSaving(true)
      const postData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      }

      if (editingPost) {
        const { error } = await supabaseAdmin.from("blog_posts").update(postData).eq("id", editingPost.id)

        if (error) throw error
      } else {
        const { error } = await supabaseAdmin.from("blog_posts").insert([postData])

        if (error) throw error
      }

      setShowEditor(false)
      setEditingPost(null)
      resetForm()
      await loadPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      alert("Failed to save post. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      author_name: post.author_name,
      category: post.category,
      is_published: post.is_published,
      is_featured: post.is_featured,
    })
    setShowEditor(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", postId)

      if (error) throw error
      await loadPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabaseAdmin
        .from("blog_posts")
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id)

      if (error) throw error
      await loadPosts()
    } catch (error) {
      console.error("Error toggling publish:", error)
    }
  }

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const { error } = await supabaseAdmin
        .from("blog_posts")
        .update({ is_featured: !post.is_featured })
        .eq("id", post.id)

      if (error) throw error
      await loadPosts()
    } catch (error) {
      console.error("Error toggling featured:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      author_name: "KaziNest Team",
      category: "Career Tips",
      is_published: false,
      is_featured: false,
    })
  }

  const openNewPost = () => {
    setEditingPost(null)
    resetForm()
    setShowEditor(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and manage blog posts</p>
          </div>
          <Button onClick={openNewPost}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {post.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          <span className="font-medium">{post.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>{post.author_name}</TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.view_count}</TableCell>
                      <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePublish(post)}
                            title={post.is_published ? "Unpublish" : "Publish"}
                          >
                            {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFeatured(post)}
                            title={post.is_featured ? "Remove featured" : "Make featured"}
                          >
                            <Star className={`h-4 w-4 ${post.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No blog posts yet. Click "New Post" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Post Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
              <DialogDescription>
                {editingPost
                  ? "Update your blog post details below."
                  : "Fill in the details to create a new blog post."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the post"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content * (HTML supported)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content here. HTML tags are supported."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured post</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
