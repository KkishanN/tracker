import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FaFire, FaClock, FaBook, FaCheckCircle, FaTrophy, FaArrowRight } from "react-icons/fa"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/api/auth/signin')

    // Fetch all stats from database
    const [subjects, studySessions, streak] = await Promise.all([
        prisma.subject.findMany({
            where: { userId: session.user.id },
            include: {
                chapters: {
                    include: {
                        tasks: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 5
        }),
        prisma.studySession.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' }
        }),
        prisma.streak.findFirst({
            where: { userId: session.user.id }
        })
    ])

    // Calculate stats
    const totalSubjects = subjects.length
    const totalChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0)
    const completedChapters = subjects.reduce((acc, s) => acc + s.chapters.filter(c => c.isCompleted).length, 0)
    const totalTasks = subjects.reduce((acc, s) => acc + s.chapters.reduce((cacc, c) => cacc + c.tasks.length, 0), 0)
    const completedTasks = subjects.reduce((acc, s) => acc + s.chapters.reduce((cacc, c) => cacc + c.tasks.filter(t => t.isCompleted).length, 0), 0)
    const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0)
    const studyHours = (totalStudyMinutes / 60).toFixed(1)
    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const stats = [
        {
            icon: FaFire,
            label: 'Current Streak',
            value: `${streak?.currentStreak || 0} Days`,
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.15)'
        },
        {
            icon: FaClock,
            label: 'Study Hours',
            value: `${studyHours}h`,
            color: '#06b6d4',
            bgColor: 'rgba(6, 182, 212, 0.15)'
        },
        {
            icon: FaBook,
            label: 'Subjects',
            value: totalSubjects.toString(),
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.15)'
        },
        {
            icon: FaCheckCircle,
            label: 'Tasks Done',
            value: `${completedTasks}/${totalTasks}`,
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.15)'
        }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'Scholar'}!
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Ready to crush your goals today?
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: stat.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={22} style={{ color: stat.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        {stat.label}
                                    </p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Progress Overview */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Overall Progress
                    </h2>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                        {completionPercent}%
                    </span>
                </div>
                <div style={{
                    height: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${completionPercent}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>{completedChapters}/{totalChapters} chapters</span>
                    <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
            </div>

            {/* Recent Subjects */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Recent Subjects
                    </h2>
                    <Link
                        href="/dashboard/subjects"
                        style={{
                            fontSize: '0.875rem',
                            color: '#8b5cf6',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        View all <FaArrowRight size={10} />
                    </Link>
                </div>

                {subjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <FaTrophy size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>No subjects yet. Start your learning journey!</p>
                        <Link
                            href="/dashboard/subjects/new"
                            className="btn-primary"
                            style={{ marginTop: '1rem', display: 'inline-flex' }}
                        >
                            Create First Subject
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {subjects.slice(0, 3).map(subject => {
                            const chapterCount = subject.chapters.length
                            const completedCount = subject.chapters.filter(c => c.isCompleted).length
                            const progress = chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0

                            return (
                                <Link
                                    key={subject.id}
                                    href={`/dashboard/subjects/${subject.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                            {subject.title}
                                        </h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {chapterCount} chapters • {completedCount} completed
                                        </p>
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(#8b5cf6 ${progress * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'var(--surface)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--text-main)'
                                        }}>
                                            {progress}%
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Link
                    href="/dashboard/subjects/new"
                    className="glass-panel"
                    style={{
                        padding: '1.25rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: '2px dashed rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#8b5cf6',
                        fontSize: '1.25rem'
                    }}>
                        +
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>New Subject</span>
                </Link>

                <Link
                    href="/dashboard/progress"
                    className="glass-panel"
                    style={{
                        padding: '1.25rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FaTrophy size={18} style={{ color: '#22c55e' }} />
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>View Progress</span>
                </Link>
            </div>
        </div>
    )
}

