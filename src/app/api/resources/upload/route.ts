import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const title = formData.get('title') as string
        const chapterId = formData.get('chapterId') as string

        if (!file || !title || !chapterId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify chapter belongs to user's subject
        const chapter = await prisma.chapter.findFirst({
            where: {
                id: chapterId,
                subject: { userId: session.user.id }
            }
        })

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', session.user.id)
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `${timestamp}-${safeFilename}`
        const filepath = path.join(uploadsDir, filename)

        // Write file to disk
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Save resource to database
        const resource = await prisma.resource.create({
            data: {
                title,
                type: 'pdf',
                url: `/uploads/${session.user.id}/${filename}`,
                chapterId
            }
        })

        return NextResponse.json({
            success: true,
            resource: {
                id: resource.id,
                title: resource.title,
                url: resource.url
            }
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload resource" },
            { status: 500 }
        )
    }
}
