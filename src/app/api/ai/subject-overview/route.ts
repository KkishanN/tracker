import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateText } from "@/lib/gemini"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { subjectId } = await request.json()

        if (!subjectId) {
            return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
        }

        // Fetch subject with all chapters
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId, userId: session.user.id },
            include: {
                chapters: {
                    orderBy: { id: 'asc' }
                }
            }
        })

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 })
        }

        // Build context from chapters
        const chapterTitles = subject.chapters.map((c, i) => `${i + 1}. ${c.title}`).join('\n')

        // Generate overview using AI
        const prompt = `You are a study assistant. Generate a concise, intuitive overview for the subject "${subject.title}".

${subject.description ? `Description: ${subject.description}` : ''}

Chapters included:
${chapterTitles || 'No chapters yet'}

Write a general overview that:
1. Explains what this subject covers at a high level (2-3 sentences)
2. Describes the main concepts and themes intuitively (not chapter-by-chapter)
3. Explains how understanding this subject benefits the learner
4. Provides a mental framework for approaching this subject

Keep it concise (under 200 words), friendly, and encouraging. Use simple language. Do NOT list chapters individually - focus on the overall picture and connections between concepts.`

        let overview: string
        try {
            overview = await generateText(prompt)
        } catch (err) {
            console.error("AI generation failed:", err)
            // Fallback overview
            overview = `📚 **${subject.title}**\n\n${subject.description || 'A comprehensive study subject.'}\n\nThis subject covers ${subject.chapters.length} chapter${subject.chapters.length !== 1 ? 's' : ''} designed to build your understanding progressively. Work through the chapters in order, use the AI intuition feature for each chapter, and track your progress with tasks.\n\n*Add more chapters and generate a new overview for AI-powered insights!*`
        }

        // Save overview to database
        await prisma.subject.update({
            where: { id: subjectId },
            data: {
                overview,
                overviewGeneratedAt: new Date()
            }
        })

        return NextResponse.json({ overview })
    } catch (error) {
        console.error("Subject overview error:", error)
        return NextResponse.json(
            { error: "Failed to generate overview" },
            { status: 500 }
        )
    }
}

// GET endpoint to fetch saved overview
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const subjectId = searchParams.get('subjectId')

        if (!subjectId) {
            return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
        }

        const subject = await prisma.subject.findUnique({
            where: { id: subjectId, userId: session.user.id },
            select: {
                overview: true,
                overviewGeneratedAt: true,
                updatedAt: true
            }
        })

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 })
        }

        // Check if overview needs regeneration (subject updated after overview was generated)
        const needsRegeneration = subject.overviewGeneratedAt
            ? subject.updatedAt > subject.overviewGeneratedAt
            : true

        return NextResponse.json({
            overview: subject.overview,
            generatedAt: subject.overviewGeneratedAt,
            needsRegeneration
        })
    } catch (error) {
        console.error("Get overview error:", error)
        return NextResponse.json({ error: "Failed to get overview" }, { status: 500 })
    }
}
