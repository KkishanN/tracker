import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateText } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { chapterId } = await req.json()

        if (!chapterId) {
            return new NextResponse("Chapter ID required", { status: 400 })
        }

        // Fetch chapter with intuition and resources
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            },
            include: {
                resources: true,
                subject: { select: { title: true } }
            }
        })

        if (!chapter) {
            return new NextResponse("Chapter not found", { status: 404 })
        }

        // Build context from chapter data
        let context = `Subject: ${chapter.subject.title}\nChapter: ${chapter.title}`

        if (chapter.intuition) {
            context += `\n\nChapter Intuition/Summary:\n${chapter.intuition}`
        }

        if (chapter.resources.length > 0) {
            const resourceTitles = chapter.resources.map(r => r.title).join(', ')
            context += `\n\nAvailable Resources: ${resourceTitles}`
        }

        const prompt = `
You are an educational assistant helping a student study.

Here is the context for the chapter they are studying:
${context}

Based on this information, generate 5-7 specific, actionable study tasks that will help the student master this material. Tasks should:
1. Start with action verbs (Read, Practice, Review, Explain, Create, etc.)
2. Be specific and measurable
3. Progress from understanding to application
4. Include a mix of reading, practice, and synthesis activities

Return ONLY a JSON array of task strings. No markdown formatting, explanations, or additional text.
Example format: ["Read and summarize key concepts", "Complete practice problems 1-5", "Create flashcards for important terms"]
`

        const text = await generateText(prompt)
        // Clean up if markdown code blocks are returned
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let tasks: string[] = []
        try {
            tasks = JSON.parse(cleanText)
        } catch (e) {
            // Fallback: split by newlines and clean up
            tasks = cleanText
                .split('\n')
                .filter(t => t.trim().length > 0)
                .map(t => t.replace(/^[\d\-\.\)]+\s*/, '').trim())
                .filter(t => t.length > 0)
                .slice(0, 7)
        }

        // Save tasks to DB
        if (Array.isArray(tasks) && tasks.length > 0) {
            await prisma.task.createMany({
                data: tasks.map(t => ({
                    description: typeof t === 'string' ? t : String(t),
                    chapterId: chapterId
                }))
            })
        }

        return NextResponse.json({ success: true, tasks, count: tasks.length })
    } catch (error) {
        console.error("AI Tasks Error:", error)
        return new NextResponse("Failed to generate tasks. Please check your API key.", { status: 500 })
    }
}

