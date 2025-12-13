import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateText } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { chapterId, contextText } = await req.json()

        if (!chapterId) {
            return NextResponse.json({ error: "Chapter ID required" }, { status: 400 })
        }

        // Fetch chapter to get more context
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            },
            include: {
                subject: { select: { title: true } },
                resources: { select: { title: true } }
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Build rich context
        let fullContext = `Subject: ${chapter.subject.title}\nChapter: ${chapter.title}`
        if (chapter.resources.length > 0) {
            fullContext += `\nResources: ${chapter.resources.map(r => r.title).join(', ')}`
        }
        if (contextText) {
            fullContext += `\n\nAdditional Context:\n${contextText.substring(0, 5000)}`
        }

        const prompt = `
You are an expert tutor helping a student understand complex topics.

Given the following chapter information:
${fullContext}

Create a "Big Picture" intuition summary that:
1. Explains the core concept in simple terms
2. Shows how it connects to related ideas
3. Provides a mental model or analogy for understanding
4. Outlines a learning roadmap

Keep the response concise (under 500 words) and use clear formatting.
`

        const intuition = await generateText(prompt)

        // Save to DB
        await prisma.chapter.update({
            where: { id: chapterId },
            data: { intuition }
        })

        return NextResponse.json({ intuition, success: true })
    } catch (error: any) {
        console.error("Intuition API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate intuition" },
            { status: 500 }
        )
    }
}

