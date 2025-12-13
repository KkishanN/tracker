import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateText } from "@/lib/gemini"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch saved transitions
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const chapterId = searchParams.get('chapterId')

        if (!chapterId) {
            return NextResponse.json({ error: "Chapter ID required" }, { status: 400 })
        }

        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            },
            select: {
                taskFlowTransitions: true
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        let transitions = []
        if (chapter.taskFlowTransitions) {
            try {
                transitions = JSON.parse(chapter.taskFlowTransitions)
            } catch (e) {
                transitions = []
            }
        }

        return NextResponse.json({ transitions, saved: !!chapter.taskFlowTransitions })
    } catch (error: any) {
        console.error("Get transitions error:", error)
        return NextResponse.json({ error: "Failed to get transitions" }, { status: 500 })
    }
}

// POST - Generate and save transitions
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { chapterId, tasks, forceRegenerate } = await req.json()

        if (!chapterId || !tasks || tasks.length < 2) {
            return NextResponse.json({ error: "Need at least 2 tasks" }, { status: 400 })
        }

        // Verify chapter belongs to user
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            },
            include: {
                subject: { select: { title: true } }
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Check if we have saved transitions and not forcing regenerate
        if (chapter.taskFlowTransitions && !forceRegenerate) {
            try {
                const savedTransitions = JSON.parse(chapter.taskFlowTransitions)
                return NextResponse.json({ transitions: savedTransitions, cached: true })
            } catch (e) {
                // Continue to generate new ones
            }
        }

        // Generate transition explanations using AI
        const taskList = tasks.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')

        const prompt = `You are a study assistant. For these study tasks in the chapter "${chapter.title}" of subject "${chapter.subject.title}", explain how completing each task prepares you for the next one.

Tasks:
${taskList}

For each transition from one task to the next, write a brief, intuitive explanation (1-2 sentences) of WHY the earlier task helps you understand or complete the next one. Focus on the learning progression and knowledge building.

Respond in JSON format:
{
  "transitions": [
    {"from": "task 1 title", "to": "task 2 title", "explanation": "your explanation"},
    ...
  ]
}

Keep explanations concise, friendly, and educational. Use simple language.`

        const result = await generateText(prompt)

        // Parse JSON response
        let transitions = []
        try {
            const jsonMatch = result.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                transitions = parsed.transitions || []
            }
        } catch (e) {
            console.error('Failed to parse AI response:', e)
            // Generate fallback transitions
            transitions = tasks.slice(0, -1).map((t: string, i: number) => ({
                from: t,
                to: tasks[i + 1],
                explanation: `Completing "${t.slice(0, 30)}..." builds the foundation for the next step.`
            }))
        }

        // Save to database
        await prisma.chapter.update({
            where: { id: chapterId },
            data: {
                taskFlowTransitions: JSON.stringify(transitions)
            }
        })

        return NextResponse.json({ transitions, cached: false })
    } catch (error: any) {
        console.error("Transitions API Error:", error)
        return NextResponse.json({
            error: error.message || "Failed to generate transitions"
        }, { status: 500 })
    }
}
