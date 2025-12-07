import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { html: finalHtml, resumeTitle, userId, isTrialUser } = await req.json()

    if (!finalHtml || finalHtml.length < 100) {
      return NextResponse.json({ error: "Missing or invalid HTML input for PDF generation." }, { status: 400 })
    }

    console.log(`[v0] PDF request: ${resumeTitle}, Trial user: ${isTrialUser}`)

    try {
      const { generatePdfFromHtml } = await import("@/lib/server-pdf-generator")
      let { pdfBase64, name: safeFileName } = await generatePdfFromHtml(finalHtml, resumeTitle)

      if (isTrialUser && userId) {
        try {
          const { addWatermarkToPdf } = await import("@/lib/pdf-watermarker")
          const pdfBuffer = Buffer.from(pdfBase64, "base64")
          const watermarkedBuffer = await addWatermarkToPdf(pdfBuffer)
          pdfBase64 = watermarkedBuffer.toString("base64")
          console.log("[v0] Watermark added to trial user PDF")
        } catch (watermarkError) {
          console.error("[v0] Failed to add watermark:", watermarkError)
          // Continue with non-watermarked PDF if watermarking fails
        }
      }

      const pdfBuffer = Buffer.from(pdfBase64, "base64")

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeFileName}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (serverError: any) {
      console.error("[PDF SERVER ERROR]", serverError)

      return NextResponse.json(
        {
          error: "Server-side PDF generation failed",
          html: finalHtml,
          title: resumeTitle,
          method: "client-fallback",
          serverError: serverError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[PDF ROUTE ERROR]", error)
    return NextResponse.json({ error: error.message || "PDF generation failed." }, { status: 500 })
  }
}
