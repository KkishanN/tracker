import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FaFire, FaBook, FaCheckCircle, FaClock, FaLightbulb, FaTrophy } from "react-icons/fa"

export default async function ProgressPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/api/auth/signin')

    // Fetch user stats
    const subjects = await prisma.subject.findMany({
        where: { userId: session.user.id },
        include: {
            chapters: {
                include: {
                    tasks: true
                }
            }
        }
    })

    // Calculate stats
    const totalSubjects = subjects.length
    const totalChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0)
    const completedChapters = subjects.reduce((acc, s) =>
        acc + s.chapters.filter(c => c.isCompleted).length, 0)
    const chaptersWithIntuition = subjects.reduce((acc, s) =>
        acc + s.chapters.filter(c => c.intuition).length, 0)
    const totalTasks = subjects.reduce((acc, s) =>
        acc + s.chapters.reduce((cacc, c) => cacc + c.tasks.length, 0), 0)
    const completedTasks = subjects.reduce((acc, s) =>
        acc + s.chapters.reduce((cacc, c) => cacc + c.tasks.filter(t => t.isCompleted).length, 0), 0)

    // Fetch streak
    const streak = await prisma.streak.findFirst({
        where: { userId: session.user.id }
    })

    const stats = [
        {
            icon: FaFire,
            label: 'Current Streak',
            value: `${streak?.currentStreak || 0} Days`,
            color: '#f97316'
        },
        {
            icon: FaBook,
            label: 'Subjects',
            value: totalSubjects.toString(),
            color: '#8b5cf6'
        },
        {
            icon: FaCheckCircle,
            label: 'Chapters Completed',
            value: `${completedChapters}/${totalChapters}`,
            color: '#22c55e'
        },
        {
            icon: FaLightbulb,
            label: 'Intuitions Generated',
            value: chaptersWithIntuition.toString(),
            color: '#facc15'
        },
        {
            icon: FaTrophy,
            label: 'Tasks Completed',
            value: `${completedTasks}/${totalTasks}`,
            color: '#ec4899'
        },
        {
            icon: FaClock,
            label: 'Last Study',
            value: streak?.lastStudyDate ? new Date(streak.lastStudyDate).toLocaleDateString() : 'Never',
            color: '#06b6d4'
        }
    ]

    const chapterProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Your Progress
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Track your learning journey and achievements
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
            }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="glass-panel" style={{ padding: '1.25rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: `${stat.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={18} style={{ color: stat.color }} />
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {stat.label}
                                </span>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {stat.value}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Progress Bars */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    Overall Progress
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Chapters</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{chapterProgress}%</span>
                    </div>
                    <div style={{
                        height: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '5px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${chapterProgress}%`,
                            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                            borderRadius: '5px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tasks</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{taskProgress}%</span>
                    </div>
                    <div style={{
                        height: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '5px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${taskProgress}%`,
                            background: 'linear-gradient(90deg, #22c55e, #06b6d4)',
                            borderRadius: '5px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                    Subject Breakdown
                </h3>

                {subjects.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No subjects yet. Create one to start tracking your progress!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {subjects.map(subject => {
                            const subjectChapters = subject.chapters.length
                            const subjectCompleted = subject.chapters.filter(c => c.isCompleted).length
                            const progress = subjectChapters > 0 ? Math.round((subjectCompleted / subjectChapters) * 100) : 0

                            return (
                                <div key={subject.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                            {subject.title}
                                        </span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {subjectCompleted}/{subjectChapters} chapters
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progress}%`,
                                            background: '#8b5cf6',
                                            borderRadius: '3px'
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
