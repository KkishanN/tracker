'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBook, FaChartLine, FaHome, FaSignOutAlt, FaBars, FaTimes, FaUser, FaChevronDown } from 'react-icons/fa'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome },
    { name: 'Subjects', href: '/dashboard/subjects', icon: FaBook },
    { name: 'Progress', href: '/dashboard/progress', icon: FaChartLine },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const isActive = (href: string) => {
        // For dashboard, only match exact path
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        // For other routes, match if starts with
        return pathname === href || pathname?.startsWith(href + '/')
    }

    return (
        <>
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    onClick={() => setIsOpen(true)}
                    className="hamburger-btn"
                    aria-label="Open menu"
                >
                    <FaBars size={24} />
                </button>
                <h1 className="gradient-text" style={{ fontSize: '1.125rem', fontWeight: 700 }}>StudyTracker</h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`sidebar-fixed ${isOpen ? 'open' : ''}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer' }}>StudyTracker</h1>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hamburger-btn"
                        aria-label="Close menu"
                        style={{ display: isOpen ? 'flex' : 'none' }}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: active ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                    color: active ? '#8b5cf6' : '#a1a1aa',
                                    border: active ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent'
                                }}
                            >
                                <Icon size={20} />
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Profile Section */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border)',
                    marginTop: 'auto'
                }}>
                    {/* Profile Button */}
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            width: '100%',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: profileOpen ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                        }}
                    >
                        {/* Avatar */}
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaUser size={16} style={{ color: 'white' }} />
                            </div>
                        )}

                        {/* Name & Email */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--text-main)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {session?.user?.name || 'User'}
                            </p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {session?.user?.email || ''}
                            </p>
                        </div>

                        {/* Chevron */}
                        <FaChevronDown
                            size={12}
                            style={{
                                color: 'var(--text-muted)',
                                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '10px',
                            border: '1px solid var(--border)'
                        }}>
                            {/* User Details */}
                            <div style={{
                                padding: '0.75rem',
                                borderBottom: '1px solid var(--border)',
                                marginBottom: '0.5rem'
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    Signed in as
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                    {session?.user?.email || 'user@example.com'}
                                </p>
                            </div>

                            {/* Sign Out Button */}
                            <button
                                onClick={() => signOut()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.625rem 0.75rem',
                                    width: '100%',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease',
                                    fontWeight: 500,
                                    fontSize: '0.875rem'
                                }}
                            >
                                <FaSignOutAlt size={14} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}



