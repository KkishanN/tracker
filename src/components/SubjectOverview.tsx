'use client'

import { useState, useEffect } from 'react'
import { FaRobot, FaSpinner, FaSync } from 'react-icons/fa'

interface SubjectOverviewProps {
    subjectId: string
    subjectTitle: string
    existingOverview?: string | null
    needsRegeneration?: boolean
}

export default function SubjectOverview({
    subjectId,
    subjectTitle,
    existingOverview,
    needsRegeneration = false
}: SubjectOverviewProps) {
    const [loading, setLoading] = useState(false)
    const [overview, setOverview] = useState<string | null>(existingOverview || null)
    const [error, setError] = useState<string | null>(null)
    const [showGlow, setShowGlow] = useState(needsRegeneration && !existingOverview === false)

    useEffect(() => {
        setOverview(existingOverview || null)
        setShowGlow(needsRegeneration)
    }, [existingOverview, needsRegeneration])

    const generateOverview = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/subject-overview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to generate overview')
            }

            const data = await res.json()
            setOverview(data.overview)
            setShowGlow(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            {/* Header with button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: overview ? '1rem' : 0
            }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Subject Overview
                </h3>
                <button
                    onClick={generateOverview}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: showGlow
                            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                            : 'rgba(139, 92, 246, 0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        color: showGlow ? 'white' : '#8b5cf6',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.3s',
                        boxShadow: showGlow ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none',
                        animation: showGlow ? 'glow 1.5s ease-in-out infinite alternate' : 'none'
                    }}
                >
                    {loading ? (
                        <>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                            Generating...
                        </>
                    ) : overview ? (
                        <>
                            <FaSync size={12} />
                            {showGlow ? 'Update Overview' : 'Regenerate'}
                        </>
                    ) : (
                        <>
                            <FaRobot size={14} />
                            Generate Overview
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {/* Overview Content */}
            {overview && !loading && (
                <div style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                    fontSize: '0.9375rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    borderLeft: '3px solid #8b5cf6'
                }}>
                    {overview}
                </div>
            )}

            {/* Empty State */}
            {!overview && !loading && !error && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)'
                }}>
                    <FaRobot size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No overview yet. Click "Generate Overview" to create an AI-powered summary of this subject.</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)'
                }}>
                    <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                    <p>Analyzing chapters and generating overview...</p>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes glow {
                    from { box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
                    to { box-shadow: 0 0 25px rgba(236, 72, 153, 0.6); }
                }
            `}</style>
        </div>
    )
}
