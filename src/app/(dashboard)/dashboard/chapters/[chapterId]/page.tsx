import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import IntuitionSection from "@/components/IntuitionSection"
import TaskList from "@/components/TaskList"
import UploadResource from "@/components/UploadResource"
import StudyTimer from "@/components/StudyTimer"
import DeleteChapterButton from "@/components/DeleteChapterButton"
import ResourceList from "@/components/ResourceList"
import Link from "next/link"
import { FaArrowLeft } from "react-icons/fa"

export default async function ChapterDetailPage({ params }: { params: { chapterId: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/api/auth/signin')

    const chapter = await prisma.chapter.findFirst({
        where: {
            id: params.chapterId,
            subject: { userId: session.user.id }
        },
        include: {
            tasks: true,
            resources: true,
            subject: { select: { id: true, title: true } }
        }
    })

    if (!chapter) notFound()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Back Link */}
            <Link
                href={`/dashboard/subjects/${chapter.subject.id}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                }}
            >
                <FaArrowLeft size={12} />
                Back to {chapter.subject.title}
            </Link>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h1 className="gradient-text" style={{
                        fontSize: '2rem',
                        fontWeight: 700
                    }}>
                        {chapter.title}
                    </h1>
                    <DeleteChapterButton
                        chapterId={chapter.id}
                        chapterTitle={chapter.title}
                        subjectId={chapter.subject.id}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <UploadResource chapterId={chapter.id} />
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {/* Left: Content & Intuition */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <IntuitionSection chapter={chapter} />
                    <ResourceList resources={chapter.resources} />
                </div>

                {/* Right: Timer, Tasks & Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Study Timer */}
                    <StudyTimer chapterId={chapter.id} />

                    <TaskList chapterId={chapter.id} tasks={chapter.tasks} />

                    {/* Voice Notes Section Placeholder */}
                    <div className="glass-panel" style={{ padding: '1.5rem', opacity: 0.5 }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            marginBottom: '0.5rem'
                        }}>
                            Voice Notes
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Coming Soon</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


