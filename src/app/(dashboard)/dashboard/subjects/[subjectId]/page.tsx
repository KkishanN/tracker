import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import CreateChapterForm from "@/components/CreateChapterForm"
import ChapterMap from "@/components/ChapterMap"
import SubjectOverview from "@/components/SubjectOverview"
import Link from "next/link"
import { FaFilePdf, FaRobot, FaCheckCircle, FaCircle, FaArrowLeft } from "react-icons/fa"

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/api/auth/signin')

    // Find subject by ID
    let subject = await prisma.subject.findFirst({
        where: {
            id: params.subjectId,
            userId: session.user.id
        },
        include: {
            chapters: {
                include: {
                    _count: { select: { resources: true, tasks: true } },
                    resources: true
                },
                orderBy: { id: 'asc' }
            }
        }
    })

    if (!subject) notFound()

    const completedCount = subject.chapters.filter(c => c.isCompleted).length
    const chaptersWithIntuition = subject.chapters.filter(c => c.intuition).length

    // Check if overview needs regeneration (subject updated after overview was generated)
    const needsRegeneration = subject.overviewGeneratedAt
        ? (subject.updatedAt > subject.overviewGeneratedAt)
        : (subject.chapters.length > 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Back Button */}
            <Link
                href="/dashboard/subjects"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                }}
            >
                <FaArrowLeft size={12} /> Back to Subjects
            </Link>

            {/* Subject Header */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h1
                    className="gradient-text"
                    style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}
                >
                    {subject.title}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {subject.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>{subject.chapters.length} chapters</span>
                    <span>•</span>
                    <span>{completedCount} completed</span>
                    <span>•</span>
                    <span>{chaptersWithIntuition} with intuition</span>
                </div>
            </div>

            {/* Subject Overview - Persistent Section */}
            <SubjectOverview
                subjectId={subject.id}
                subjectTitle={subject.title}
                existingOverview={subject.overview}
                needsRegeneration={needsRegeneration}
            />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <ChapterMap chapters={subject.chapters} subjectTitle={subject.title} />
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Chapters List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Chapters
                    </h2>

                    {subject.chapters.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No chapters yet. Add your first chapter below.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {subject.chapters.map((chapter, index) => (
                                <Link
                                    key={chapter.id}
                                    href={`/dashboard/chapters/${chapter.id}`}
                                    className="chapter-item"
                                >
                                    <div className={`chapter-status-icon ${chapter.isCompleted ? 'completed' : 'open'}`}>
                                        {chapter.isCompleted ? <FaCheckCircle size={12} /> : <FaCircle size={8} />}
                                    </div>
                                    <div className="chapter-content">
                                        <div className="chapter-title">
                                            #{index + 1} {chapter.title}
                                        </div>
                                        <div className="chapter-meta">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <FaFilePdf size={10} /> {chapter._count.resources} resources
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <FaRobot size={10} /> {chapter._count.tasks} tasks
                                            </span>
                                            {chapter.intuition && (
                                                <span style={{ color: '#22c55e' }}>✓ Has intuition</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <CreateChapterForm subjectId={subject.id} />
                </div>
            </div>
        </div>
    )
}

