'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const description = formData.get("description") as string
    const chapterId = formData.get("chapterId") as string

    if (!description || !chapterId) {
        throw new Error("Missing required fields")
    }

    // Verify the chapter belongs to a subject owned by the user
    const chapter = await prisma.chapter.findFirst({
        where: {
            id: chapterId,
            subject: { userId: session.user.id }
        }
    })

    if (!chapter) {
        throw new Error("Chapter not found")
    }

    await prisma.task.create({
        data: {
            description,
            chapterId
        }
    })

    revalidatePath(`/dashboard/chapters/${chapterId}`)
}

export async function toggleTask(taskId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Find task and verify ownership
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            chapter: {
                subject: { userId: session.user.id }
            }
        },
        include: { chapter: true }
    })

    if (!task) {
        throw new Error("Task not found")
    }

    await prisma.task.update({
        where: { id: taskId },
        data: { isCompleted: !task.isCompleted }
    })

    revalidatePath(`/dashboard/chapters/${task.chapterId}`)

    return { success: true, isCompleted: !task.isCompleted }
}

export async function deleteTask(taskId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            chapter: {
                subject: { userId: session.user.id }
            }
        }
    })

    if (!task) {
        throw new Error("Task not found")
    }

    await prisma.task.delete({
        where: { id: taskId }
    })

    revalidatePath(`/dashboard/chapters/${task.chapterId}`)
}
