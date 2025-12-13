import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find or create streak
    const streak = await prisma.streak.findFirst({
        where: { userId }
    })

    if (!streak) {
        await prisma.streak.create({
            data: {
                userId,
                currentStreak: 1,
                lastStudyDate: new Date()
            }
        })
        return NextResponse.json({ message: "Streak started" })
    }

    // Check if last study date was yesterday
    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : new Date(0)
    lastDate.setHours(0, 0, 0, 0)

    const diffTime = Math.abs(today.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return NextResponse.json({ message: "Already checked in today" })
    } else if (diffDays === 1) {
        // Increment streak
        await prisma.streak.update({
            where: { id: streak.id },
            data: {
                currentStreak: streak.currentStreak + 1,
                lastStudyDate: new Date()
            }
        })
        return NextResponse.json({ message: "Streak incremented" })
    } else {
        // Reset streak
        await prisma.streak.update({
            where: { id: streak.id },
            data: {
                currentStreak: 1,
                lastStudyDate: new Date()
            }
        })
        return NextResponse.json({ message: "Streak reset" })
    }
}
