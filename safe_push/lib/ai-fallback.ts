import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
const groqApiKey = process.env.GROQ_API_KEY

// Initialize providers
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null

if (!geminiApiKey && !groqApiKey) {
  console.warn("⚠️ Warning: Neither Gemini nor Groq API keys are configured. AI features will not work.")
}

/**
 * Generate text using Gemini with Groq fallback
 */
export async function generateTextWithFallback(prompt: string): Promise<string> {
  let lastError: Error | null = null

  // Try Gemini first
  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      if (text && text.trim().length > 0) {
        console.log("[v0] Successfully generated text with Gemini")
        return text
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn("[v0] Gemini generation failed, attempting Groq fallback:", lastError.message)
    }
  }

  // Fall back to Groq
  if (groqClient) {
    try {
      const message = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const textContent = message.choices[0]?.message?.content
      if (textContent && typeof textContent === "string" && textContent.trim().length > 0) {
        console.log("[v0] Successfully generated text with Groq (fallback)")
        return textContent
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error("[v0] Groq fallback also failed:", lastError.message)
    }
  }

  // If we get here, both providers failed
  const errorMsg = lastError
    ? `Both Gemini and Groq failed. Last error: ${lastError.message}`
    : "Neither Gemini nor Groq API is configured"
  throw new Error(errorMsg)
}

/**
 * Test connection to both providers
 */
export async function testAIConnections(): Promise<{
  gemini: { available: boolean; message: string }
  groq: { available: boolean; message: string }
}> {
  const results = {
    gemini: { available: false, message: "" },
    groq: { available: false, message: "" },
  }

  // Test Gemini
  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" })
      const result = await model.generateContent("Say 'OK' in one word.")
      const response = await result.response
      const text = response.text()
      results.gemini = { available: true, message: `Connection successful: ${text}` }
    } catch (error) {
      results.gemini = {
        available: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  } else {
    results.gemini = { available: false, message: "API key not configured" }
  }

  // Test Groq
  if (groqClient) {
    try {
      const message = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Say 'OK' in one word.",
          },
        ],
      })
      const textContent = message.choices[0]?.message?.content
      const text = textContent && typeof textContent === "string" ? textContent : "No response"
      results.groq = { available: true, message: `Connection successful: ${text}` }
    } catch (error) {
      results.groq = {
        available: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  } else {
    results.groq = { available: false, message: "API key not configured" }
  }

  return results
}

export { geminiClient, groqClient }
