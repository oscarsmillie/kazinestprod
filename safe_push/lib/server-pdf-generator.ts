import chromium from "@sparticuz/chromium"
import { chromium as playwrightChromium } from "playwright-core"

/**
 * Server-side PDF generator for production Vercel deployment
 * Uses playwright-core + @sparticuz/chromium for serverless compatibility
 */
export async function generatePdfFromHtml(html: string, title?: string) {
  console.log("[PDF] Launching serverless Chromium for PDF generation...")

  try {
    const executablePath = await chromium.executablePath()

    const browser = await playwrightChromium.launch({
      headless: true,
      args: chromium.args,
      executablePath,
    })

    try {
      const page = await browser.newPage()

      await page.setContent(html, {
        waitUntil: "networkidle",
      })

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      })

      await page.close()
      console.log("[PDF] PDF generated successfully, size:", pdfBuffer.length, "bytes")

      return {
        pdfBase64: pdfBuffer.toString("base64"),
        name: sanitizeFileName(title || "resume.pdf"),
      }
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error("[PDF PLAYWRIGHT ERROR]", error)
    throw error
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .concat(".pdf")
}
