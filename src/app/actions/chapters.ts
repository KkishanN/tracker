'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateSlug } from "@/lib/slug"

export async function createChapter(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return

    const title = formData.get("title") as string
    const subjectId = formData.get("subjectId") as string

    if (!title || !subjectId) return

    // Generate unique slug for this subject
    let slug = generateSlug(title)
    let counter = 1

    while (true) {
        const existing = await prisma.chapter.findUnique({
            where: {
                subjectId_slug: {
                    subjectId: subjectId,
                    slug: slug
                }
            }
        })
        if (!existing) break
        slug = `${generateSlug(title)}-${counter}`
        counter++
    }

    // Get the subject to find its slug for redirect
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        select: { slug: true }
    })

    await prisma.chapter.create({
        data: {
            title,
            slug,
            subjectId
        }
    })

    revalidatePath(`/dashboard/subjects/${subject?.slug || subjectId}`)
}

