import { PDFDocument, rgb, degrees } from "pdf-lib"

/**
 * Adds a watermark to a PDF for trial users
 * Creating new utility to watermark PDFs for non-paid trial resumes
 */
export async function addWatermarkToPdf(pdfBytes: Buffer): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()

    for (const page of pages) {
      const { width, height } = page.getSize()

      // Add diagonal watermark text
      page.drawText("Made with KaziNest – Upgrade for full version", {
        x: width / 2 - 150,
        y: height / 2,
        size: 40,
        color: rgb(0.85, 0.85, 0.85),
        rotate: degrees(-45),
        opacity: 0.2,
      })

      // Add footer watermark
      page.drawText("Trial Version - Watermarked", {
        x: 10,
        y: 10,
        size: 10,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.3,
      })
    }

    return Buffer.from(await pdfDoc.save())
  } catch (error) {
    console.error("[v0] Error adding watermark to PDF:", error)
    throw new Error("Failed to add watermark to PDF")
  }
}
