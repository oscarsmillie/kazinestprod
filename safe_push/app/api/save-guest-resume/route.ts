export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Optional: default template if none provided
const DEFAULT_TEMPLATE = "Black-White-Simple"

export async function POST(req: Request) {
  try {
    // Import Supabase at runtime to avoid top-level issues in GCP
    const { createClient } = await import("@supabase/supabase-js")

    const body = await req.json()
    const { email, firstName, lastName, phone, resumeData, templateId } = body

    // Validate required fields
    const missingFields: string[] = []
    if (!email) missingFields.push("email")
    if (!firstName) missingFields.push("firstName")
    if (!lastName) missingFields.push("lastName")
    if (!resumeData) missingFields.push("resumeData")

    if (missingFields.length > 0) {
      console.warn("[SAVE-GUEST-RESUME] Missing required fields:", missingFields)
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(", ")}`, missingFields }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const chosenTemplate = templateId || DEFAULT_TEMPLATE

    // Create Supabase client at runtime using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not set")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("guest_resumes")
      .insert({
        email,
        template_id: chosenTemplate,
        title: `${firstName} ${lastName}`,
        resume_data: resumeData,
        payment_status: "unpaid",
        phone: phone || null,
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      console.error("[SAVE-GUEST-RESUME] Supabase insert failed:", { error, data })
      return new Response(
        JSON.stringify({
          error: `Supabase error: ${error?.message || "Unknown"}`,
          details: error?.details,
          hint: error?.hint,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    console.log("[SAVE-GUEST-RESUME] Inserted guest resume with id:", data.id)

    // Return mapped id for frontend
    return new Response(JSON.stringify({ success: true, resumeId: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[SAVE-GUEST-RESUME] Unexpected error:", err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
