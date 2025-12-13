'use client'

import { useState } from 'react'
import { FaMap, FaTimes, FaLightbulb, FaCheckCircle, FaCircle, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'

interface Chapter {
    id: string
    title: string
    isCompleted: boolean
    intuition: string | null
}

interface ChapterMapProps {
    chapters: Chapter[]
    subjectTitle: string
}

export default function ChapterMap({ chapters, subjectTitle }: ChapterMapProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

    if (chapters.length === 0) {
        return null
    }

    // Calculate progress
    const completedCount = chapters.filter(c => c.isCompleted).length
    const intuitionCount = chapters.filter(c => c.intuition).length
    const progressPercent = Math.round((completedCount / chapters.length) * 100)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-secondary"
            >
                <FaMap size={14} />
                View Learning Path
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div
                        className="modal-content animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '950px', maxHeight: '90vh', overflow: 'auto' }}
                    >
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    {subjectTitle} - Learning Path
                                </h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {completedCount}/{chapters.length} chapters completed • {intuitionCount} with intuition
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Progress Bar */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <span>Progress</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progressPercent}%`,
                                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Learning Path Timeline */}
                            <div style={{ position: 'relative', paddingLeft: '40px' }}>
                                {/* Vertical line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '20px',
                                    bottom: '20px',
                                    width: '2px',
                                    background: 'linear-gradient(to bottom, #8b5cf6, #ec4899)',
                                    opacity: 0.3
                                }} />

                                {chapters.map((chapter, index) => {
                                    const isLast = index === chapters.length - 1
                                    const nodeColor = chapter.isCompleted ? '#8b5cf6' : '#22c55e'

                                    return (
                                        <div
                                            key={chapter.id}
                                            style={{
                                                position: 'relative',
                                                marginBottom: isLast ? 0 : '1.5rem',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSelectedChapter(selectedChapter?.id === chapter.id ? null : chapter)}
                                        >
                                            {/* Node indicator */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-33px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: chapter.isCompleted ? 'rgba(139, 92, 246, 0.3)' : 'rgba(34, 197, 94, 0.2)',
                                                border: `2px solid ${nodeColor}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {chapter.isCompleted ? (
                                                    <FaCheckCircle size={12} style={{ color: '#8b5cf6' }} />
                                                ) : (
                                                    <FaCircle size={8} style={{ color: '#22c55e' }} />
                                                )}
                                            </div>

                                            {/* Chapter card */}
                                            <div style={{
                                                padding: '1rem 1.25rem',
                                                background: selectedChapter?.id === chapter.id
                                                    ? 'rgba(139, 92, 246, 0.15)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: selectedChapter?.id === chapter.id
                                                    ? '1px solid rgba(139, 92, 246, 0.4)'
                                                    : '1px solid var(--border)',
                                                borderRadius: '12px',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            marginBottom: '0.25rem'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '0.125rem 0.5rem',
                                                                borderRadius: '9999px',
                                                                background: chapter.isCompleted
                                                                    ? 'rgba(139, 92, 246, 0.2)'
                                                                    : 'rgba(34, 197, 94, 0.2)',
                                                                color: chapter.isCompleted ? '#a78bfa' : '#86efac'
                                                            }}>
                                                                Chapter {index + 1}
                                                            </span>
                                                            {chapter.intuition && (
                                                                <FaLightbulb size={12} style={{ color: '#facc15' }} />
                                                            )}
                                                        </div>
                                                        <h4 style={{
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            color: chapter.isCompleted ? '#a78bfa' : 'var(--text-main)'
                                                        }}>
                                                            {chapter.title}
                                                        </h4>
                                                    </div>
                                                    <Link
                                                        href={`/dashboard/chapters/${chapter.id}`}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            color: '#8b5cf6',
                                                            textDecoration: 'none',
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '6px',
                                                            background: 'rgba(139, 92, 246, 0.1)'
                                                        }}
                                                    >
                                                        Open <FaArrowRight size={10} />
                                                    </Link>
                                                </div>

                                                {/* Expanded content */}
                                                {selectedChapter?.id === chapter.id && chapter.intuition && (
                                                    <div style={{
                                                        marginTop: '1rem',
                                                        paddingTop: '1rem',
                                                        borderTop: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            marginBottom: '0.5rem',
                                                            fontSize: '0.75rem',
                                                            color: '#facc15'
                                                        }}>
                                                            <FaLightbulb size={12} />
                                                            Intuition Preview
                                                        </div>
                                                        <p style={{
                                                            fontSize: '0.875rem',
                                                            color: 'var(--text-muted)',
                                                            lineHeight: 1.6
                                                        }}>
                                                            {chapter.intuition.slice(0, 200)}
                                                            {chapter.intuition.length > 200 && '...'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginTop: '2rem',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid var(--border)',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCircle size={8} style={{ color: '#22c55e' }} />
                                    In Progress
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle size={10} style={{ color: '#8b5cf6' }} />
                                    Completed
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaLightbulb size={10} style={{ color: '#facc15' }} />
                                    Has Intuition
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

