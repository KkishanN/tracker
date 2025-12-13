import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: { chapterId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Verify chapter belongs to user
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: params.chapterId,
                subject: { userId: session.user.id }
            },
            include: {
                subject: { select: { id: true } }
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Delete the chapter (cascades to tasks and resources)
        await prisma.chapter.delete({
            where: { id: params.chapterId }
        })

        return NextResponse.json({
            success: true,
            message: "Chapter deleted",
            subjectId: chapter.subject.id
        })
    } catch (error) {
        console.error("Delete chapter error:", error)
        return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
    }
}
