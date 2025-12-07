import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const { generatePdfFromHtml } = await import("@/lib/server-pdf-generator")

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase URL and Key are required" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const url = new URL(request.url)
    const resumeId = url.searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    const { data: resumeData, error } = await supabase
      .from("guest_resumes")
      .select("*")
      .eq("id", resumeId)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!resumeData) return NextResponse.json({ error: "Resume not found" }, { status: 404 })

    return NextResponse.json({
      resume: resumeData,
    })
  } catch (err: any) {
    console.error("[get-guest-resume] Error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
