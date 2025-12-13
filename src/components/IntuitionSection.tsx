'use client'

import { useState } from "react"
import { FaRobot, FaLightbulb, FaRedo, FaSpinner } from "react-icons/fa"

export default function IntuitionSection({ chapter }: { chapter: any }) {
    const [loading, setLoading] = useState(false)
    const [intuition, setIntuition] = useState<string | null>(chapter.intuition)
    const [error, setError] = useState<string | null>(null)

    const generateIntuition = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/intuition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterId: chapter.id,
                    contextText: `Generate an intuitive summary for chapter: ${chapter.title}`
                })
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate intuition')
            }

            if (data.intuition && !data.intuition.includes('Failed to generate')) {
                setIntuition(data.intuition)
            } else {
                throw new Error('AI returned an error. Please check your GEMINI_API_KEY in .env')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate intuition')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <FaLightbulb style={{ color: '#facc15' }} />
                    Concept Intuition
                </h3>

                {/* Always show button when no intuition or on error */}
                {(!intuition || error) && (
                    <button
                        onClick={generateIntuition}
                        disabled={loading}
                        style={{
                            fontSize: '0.75rem',
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            transition: 'background 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                Generating...
                            </>
                        ) : error ? (
                            <>
                                <FaRedo size={12} />
                                Retry
                            </>
                        ) : (
                            <>
                                <FaRobot size={12} />
                                Generate Big Picture
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {/* Content */}
            {intuition ? (
                <div style={{
                    color: 'var(--text-muted)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem'
                }}>
                    {intuition}
                </div>
            ) : !error && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                }}>
                    <p>Click "Generate Big Picture" to create an AI-powered summary of this chapter.</p>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

