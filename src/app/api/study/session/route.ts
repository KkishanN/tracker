import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { chapterId, duration } = await req.json()

        if (!chapterId || !duration) {
            return NextResponse.json({ error: "Missing chapterId or duration" }, { status: 400 })
        }

        // Verify chapter belongs to user
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Create study session
        const studySession = await prisma.studySession.create({
            data: {
                userId: session.user.id,
                duration: duration // in minutes
            }
        })

        // Update streak
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let streak = await prisma.streak.findFirst({
            where: { userId: session.user.id }
        })

        if (streak) {
            const lastStudy = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null
            if (lastStudy) {
                lastStudy.setHours(0, 0, 0, 0)
            }

            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            if (lastStudy?.getTime() === yesterday.getTime()) {
                // Consecutive day - increment streak
                await prisma.streak.update({
                    where: { id: streak.id },
                    data: {
                        currentStreak: streak.currentStreak + 1,
                        lastStudyDate: new Date()
                    }
                })
            } else if (lastStudy?.getTime() !== today.getTime()) {
                // Gap in streak - reset to 1
                await prisma.streak.update({
                    where: { id: streak.id },
                    data: {
                        currentStreak: 1,
                        lastStudyDate: new Date()
                    }
                })
            }
        } else {
            // First time studying
            await prisma.streak.create({
                data: {
                    userId: session.user.id,
                    currentStreak: 1,
                    lastStudyDate: new Date()
                }
            })
        }

        return NextResponse.json({ success: true, session: studySession })
    } catch (error) {
        console.error("Study session error:", error)
        return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
    }
}
