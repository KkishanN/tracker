'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { generateSlug } from "@/lib/slug"

export async function createSubject(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!title) return

    // Generate unique slug
    let slug = generateSlug(title)
    let counter = 1

    // Check if slug exists for this user
    while (true) {
        const existing = await prisma.subject.findUnique({
            where: {
                userId_slug: {
                    userId: session.user.id,
                    slug: slug
                }
            }
        })
        if (!existing) break
        slug = `${generateSlug(title)}-${counter}`
        counter++
    }

    await prisma.subject.create({
        data: {
            title,
            slug,
            description,
            userId: session.user.id
        }
    })

    revalidatePath('/dashboard/subjects')
    redirect('/dashboard/subjects')
}

