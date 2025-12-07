import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateTextWithFallback } from "./ai-fallback"

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""

if (!apiKey) {
  console.error("⚠️ Warning: Gemini API key is missing. AI features will not work.")
}

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

/**
 * Generate text using Gemini AI with Groq fallback
 * Now uses fallback system that tries Gemini first, then Groq
 */
export async function generateText(prompt: string): Promise<string> {
  return generateTextWithFallback(prompt)
}

/**
 * Generate a professional summary based on resume data
 */
export async function generateProfessionalSummary(resumeData: any): Promise<string> {
  const professionalTagline = resumeData.personalInfo?.tagline || resumeData.personalInfo?.professionalTagline || ""

  if (!professionalTagline) {
    return "Please provide a professional tagline to generate your professional summary."
  }

  const prompt = `Write a compelling professional summary (100-150 words) based ONLY on this professional tagline:

Professional Tagline: "${professionalTagline}"

Requirements:
- Write in third person using neutral language (e.g., "A results-driven professional..." or "Experienced in...")
- Avoid using gendered pronouns (he, she, him, her, his, etc.)
- Use "they/their" or refer to the person by name/title if gender-specific language is necessary
- 100-150 words exactly (critical - do not exceed)
- Use the professional tagline as the foundation and expand on it naturally
- Open with a strong positioning statement that captures their professional identity
- Showcase expertise and value proposition
- Use sophisticated, professional language
- Ensure ATS-friendly with industry-standard terminology
- Make it compelling and unique to their stated profession
- Do not include work experience, education, or skills details

Return only the summary text without labels or headings.`

  return await generateTextWithFallback(prompt)
}

/**
 * Generate work descriptions based on job title and company
 */
export async function generateWorkDescriptions(jobTitle: string, employer: string): Promise<string[]> {
  const prompt = `As a professional career advisor, generate exactly 5 compelling achievement-focused bullet points for this position:

Job Title: ${jobTitle}
Company: ${employer}

Requirements for each bullet point:
- Begin with a powerful action verb in past tense (Led, Spearheaded, Architected, Drove, Delivered, Transformed, etc.)
- Focus on measurable business impact and quantifiable results (use percentages, numbers, dollar amounts)
- Demonstrate strategic thinking and leadership qualities
- Highlight technical expertise and industry-relevant skills
- Show progression of responsibility and scope of influence
- Use professional, executive-level language
- Keep each point concise (1-2 lines maximum)
- Ensure ATS-friendly with industry-standard keywords

Format: Return exactly 5 bullet points, one per line, without numbering, dashes, or bullets. Each line should be a complete, impactful statement.

Example quality level:
"Spearheaded cross-functional team of 12 engineers to deliver enterprise platform, resulting in 45% increase in operational efficiency and $2M annual cost savings"
"Architected scalable microservices infrastructure handling 10M+ daily transactions with 99.99% uptime, reducing system latency by 60%"`

  const text = await generateTextWithFallback(prompt)

  const descriptions = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Pad with empty strings if fewer than 5, or trim to exactly 5
  while (descriptions.length < 5) {
    descriptions.push("")
  }

  return descriptions.slice(0, 5)
}

export const generateWorkDescription = generateWorkDescriptions

/**
 * Suggest skills based on resume data
 */
export async function suggestSkills(resumeData: any): Promise<string[]> {
  const tagline = resumeData.personalInfo?.tagline || ""
  const summary = resumeData.professionalSummary || ""
  const workExp = resumeData.workExperience || []
  const currentSkills = resumeData.currentSkills || resumeData.skills || []
  const jobDescription = resumeData.jobDescription || ""

  // Build context from available resume data
  let context = ""

  if (tagline) {
    context += `Professional Tagline: ${tagline}\n`
  }

  if (summary) {
    context += `Professional Summary: ${summary}\n`
  }

  if (workExp.length > 0) {
    context += `Work Experience:\n`
    workExp.forEach((exp: any) => {
      context += `- ${exp.jobTitle} at ${exp.employer}${exp.description ? ": " + exp.description : ""}\n`
    })
  }

  if (currentSkills.length > 0) {
    context += `Current Skills: ${currentSkills.join(", ")}\n`
  }

  if (jobDescription) {
    context += `Target Job: ${jobDescription}\n`
  }

  const prompt = `Based on this professional background, suggest 5-8 relevant skills that would enhance their resume:

${context}

Requirements:
- Suggest skills that are NOT already in their current skills list
- Focus on skills that complement their experience and professional goals
- Include both technical and soft skills
- Use industry-standard skill names
- Return only skill names, one per line
- No numbering, bullets, or explanations`

  const text = await generateTextWithFallback(prompt)
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.match(/^\d+\.|^[-•*]/))
}

/**
 * Generate a cover letter
 */
export async function generateCoverLetter(data: {
  jobTitle: string
  companyName: string
  resumeData: any
}): Promise<string> {
  const { jobTitle, companyName, resumeData } = data

  const prompt = `Write a professional cover letter for this job application:

Job Title: ${jobTitle}
Company: ${companyName}

Applicant Background:
Name: ${resumeData.personalInfo?.fullName || ""}
Summary: ${resumeData.professionalSummary || ""}
Experience: ${resumeData.workExperience?.map((exp: any) => `${exp.jobTitle} at ${exp.employer} (${exp.startDate} - ${exp.endDate || "Present"})`).join(", ") || ""}
Skills: ${resumeData.skills?.join(", ") || ""}

Requirements:
- Strong opening paragraph mentioning the specific role
- Highlight relevant experience and skills
- Show enthusiasm for the role and company
- Professional closing with call to action
- Keep it concise (3-4 paragraphs)

Return only the cover letter text.`

  return await generateTextWithFallback(prompt)
}

/**
 * Generate a professional email
 */
export async function generateEmail(data: {
  purpose: string
  context: string
  tone?: "formal" | "casual" | "friendly"
}): Promise<string> {
  const { purpose, context, tone = "professional" } = data

  const prompt = `Write a ${tone} email with these details:

Purpose: ${purpose}
Context: ${context}

Requirements:
- Include appropriate subject line
- Professional greeting
- Clear statement of purpose
- Necessary context
- Professional closing

Format:
Subject: [subject line]

[email body]`

  return await generateTextWithFallback(prompt)
}

/**
 * Optimize resume for ATS (Applicant Tracking System)
 */
export async function optimizeForATS(
  resumeData: any,
  jobDescription: string,
): Promise<{
  score: number
  suggestions: string[]
  keywords: string[]
}> {
  const prompt = `Analyze this resume against the job description for ATS compatibility.

Job Description:
${jobDescription}

Resume:
Name: ${resumeData.personalInfo?.fullName || ""}
Summary: ${resumeData.professionalSummary || ""}
Experience: ${resumeData.workExperience?.map((exp: any) => exp.jobTitle).join(", ") || ""}
Skills: ${resumeData.skills?.join(", ") || ""}

Provide:
1. ATS compatibility score (0-100)
2. 5-7 specific improvement suggestions
3. 10-15 important keywords from job description

Return ONLY valid JSON in this exact format:
{
  "score": <number>,
  "suggestions": [<array of strings>],
  "keywords": [<array of strings>]
}`

  const text = await generateTextWithFallback(prompt)

  try {
    const result = JSON.parse(text)
    return result
  } catch (error) {
    return {
      score: 70,
      suggestions: [
        "Add more keywords from the job description",
        "Quantify achievements with numbers and metrics",
        "Use industry-standard terminology",
        "Ensure consistent formatting",
        "Include relevant certifications",
      ],
      keywords: ["leadership", "project management", "team collaboration", "problem solving", "communication"],
    }
  }
}

export const optimizeResumeForATS = optimizeForATS

export const generateSkillsSuggestions = suggestSkills

export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!apiKey) {
      return {
        success: false,
        message: "Gemini API key is not configured",
      }
    }

    const result = await model.generateContent("Say 'Hello' in one word.")
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      message: `Connection successful. Response: ${text}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export { genAI, model }
