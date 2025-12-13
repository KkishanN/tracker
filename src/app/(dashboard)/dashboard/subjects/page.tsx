import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FaPlus, FaBook, FaFolder, FaChevronRight } from "react-icons/fa"

export default async function SubjectsPage() {
    const session = await getServerSession(authOptions)

    const subjects = session?.user?.id ? await prisma.subject.findMany({
        where: { userId: session.user.id },
        include: {
            _count: { select: { chapters: true } },
            chapters: { select: { isCompleted: true } }
        },
        orderBy: { updatedAt: 'desc' }
    }) : []

    return (
        <div style={{ padding: '0.5rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '0.25rem'
                    }}>
                        Your Subjects
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {subjects.length} subject{subjects.length !== 1 ? 's' : ''} in your library
                    </p>
                </div>
                <Link
                    href="/dashboard/subjects/new"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaPlus size={12} />
                    New Subject
                </Link>
            </div>

            {subjects.length === 0 ? (
                <div
                    className="glass-panel"
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        maxWidth: '500px',
                        margin: '2rem auto'
                    }}
                >
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}
                    >
                        <FaFolder size={32} style={{ color: '#8b5cf6' }} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        No subjects yet
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Start your learning journey by creating your first subject.
                        Add chapters, upload resources, and track your progress.
                    </p>
                    <Link
                        href="/dashboard/subjects/new"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <FaPlus size={12} />
                        Create Your First Subject
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem'
                }}>
                    {subjects.map((subject) => {
                        const completedChapters = subject.chapters.filter(c => c.isCompleted).length
                        const totalChapters = subject._count.chapters
                        const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0

                        return (
                            <Link
                                key={subject.id}
                                href={`/dashboard/subjects/${subject.id}`}
                                style={{
                                    display: 'block',
                                    padding: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                className="subject-card-hover"
                            >
                                {/* Card Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaBook size={20} style={{ color: 'white' }} />
                                    </div>
                                    <FaChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                                </div>

                                {/* Title & Description */}
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {subject.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.5,
                                    marginBottom: '1rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {subject.description || "No description provided"}
                                </p>

                                {/* Progress Bar */}
                                {totalChapters > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            marginBottom: '0.375rem'
                                        }}>
                                            <span>Progress</span>
                                            <span>{progressPercent}%</span>
                                        </div>
                                        <div style={{
                                            height: '6px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${progressPercent}%`,
                                                background: progressPercent === 100
                                                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                                    : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                                borderRadius: '3px',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--border)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <span>{totalChapters} chapter{totalChapters !== 1 ? 's' : ''}</span>
                                    <span>{new Date(subject.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            <style>{`
                .subject-card-hover:hover {
                    border-color: rgba(139, 92, 246, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    )
}
