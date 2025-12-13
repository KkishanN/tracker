import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FaArrowLeft, FaUsers, FaBook, FaClock, FaFire } from "react-icons/fa"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/api/auth/signin')

    // Simple admin check - you can enhance this with proper role-based access
    const adminEmails = ['kishan.nadageri@gmail.com'] // Add admin emails here
    if (!adminEmails.includes(session.user.email || '')) {
        redirect('/dashboard')
    }

    // Fetch all users with their stats
    const users = await prisma.user.findMany({
        include: {
            subjects: {
                include: {
                    _count: { select: { chapters: true } }
                }
            },
            studySessions: true,
            streaks: true
        },
        orderBy: { id: 'desc' }
    })

    // Calculate stats
    const totalUsers = users.length
    const totalSubjects = users.reduce((acc, u) => acc + u.subjects.length, 0)
    const totalStudyTime = users.reduce((acc, u) =>
        acc + u.studySessions.reduce((s, ss) => s + ss.duration, 0), 0
    )

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        marginBottom: '1rem'
                    }}
                >
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
                <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>
                    Admin Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    User statistics and metrics
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FaUsers style={{ color: '#8b5cf6' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</span>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{totalUsers}</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FaBook style={{ color: '#22c55e' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Subjects</span>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{totalSubjects}</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FaClock style={{ color: '#ec4899' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Study Time</span>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{Math.round(totalStudyTime / 60)}h</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    All Users ({totalUsers})
                </h2>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>User</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Subjects</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Study Hours</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Streak</th>

                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const studyHours = Math.round(
                                    user.studySessions.reduce((acc, s) => acc + s.duration, 0) / 60
                                )
                                const currentStreak = user.streaks[0]?.currentStreak || 0

                                return (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name || 'User'}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {(user.name || 'U')[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <span style={{ fontWeight: 500 }}>{user.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                background: 'rgba(139, 92, 246, 0.2)',
                                                color: '#a78bfa',
                                                fontSize: '0.875rem'
                                            }}>
                                                {user.subjects.length}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {studyHours}h
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                                <FaFire style={{ color: currentStreak > 0 ? '#f97316' : 'var(--text-muted)' }} size={12} />
                                                {currentStreak}
                                            </span>
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
