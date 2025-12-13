'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaCheckCircle, FaCircle, FaSpinner, FaLightbulb, FaArrowDown, FaSync } from 'react-icons/fa'

interface Task {
    id: string
    title: string
    isCompleted: boolean
}

interface TaskFlowMapProps {
    tasks: Task[]
    chapterTitle: string
    chapterId: string
}

interface TransitionExplanation {
    from: string
    to: string
    explanation: string
}

interface CachedTransitions {
    transitions: TransitionExplanation[]
    taskHash: string
    timestamp: number
}

export default function TaskFlowMap({ tasks, chapterTitle, chapterId }: TaskFlowMapProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [transitions, setTransitions] = useState<TransitionExplanation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCached, setIsCached] = useState(false)

    // Create a hash of task titles to detect changes
    const createTaskHash = () => tasks.map(t => t.title).join('|')
    const cacheKey = `taskflow-${chapterId}`

    // Load cached transitions on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(cacheKey)
            if (cached) {
                const data: CachedTransitions = JSON.parse(cached)
                const currentHash = createTaskHash()

                // Use cache if task titles haven't changed
                if (data.taskHash === currentHash && data.transitions.length > 0) {
                    setTransitions(data.transitions)
                    setIsCached(true)
                }
            }
        } catch (e) {
            console.log('Cache read error:', e)
        }
    }, [chapterId, tasks])

    const generateTransitions = async (forceRefresh = false) => {
        if (tasks.length < 2) return

        // Don't regenerate if we have cached transitions and not forcing refresh
        if (!forceRefresh && transitions.length > 0) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/ai/transitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterId,
                    tasks: tasks.map(t => t.title)
                })
            })

            if (!res.ok) {
                throw new Error('Failed to generate transitions')
            }

            const data = await res.json()
            const newTransitions = data.transitions || []
            setTransitions(newTransitions)
            setIsCached(true)

            // Cache to localStorage
            try {
                const cacheData: CachedTransitions = {
                    transitions: newTransitions,
                    taskHash: createTaskHash(),
                    timestamp: Date.now()
                }
                localStorage.setItem(cacheKey, JSON.stringify(cacheData))
            } catch (e) {
                console.log('Cache write error:', e)
            }
        } catch (err) {
            setError('Could not generate task transitions')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && transitions.length === 0 && tasks.length >= 2) {
            generateTransitions()
        }
    }, [isOpen])

    const completedCount = tasks.filter(t => t.isCompleted).length
    const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

    const getTransition = (fromIndex: number) => {
        const fromTask = tasks[fromIndex]?.title
        return transitions.find((t, i) => i === fromIndex) ||
            transitions.find(t =>
                t.from.toLowerCase().includes(fromTask?.toLowerCase().slice(0, 20)) ||
                fromTask?.toLowerCase().includes(t.from.toLowerCase().slice(0, 20))
            )
    }

    if (tasks.length === 0) {
        return null
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#a78bfa',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
            >
                <FaLightbulb size={14} />
                View Task Flow
                {isCached && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>✓</span>}
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div
                        className="modal-content animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
                    >
                        {/* Header */}
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    Task Learning Flow
                                </h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {chapterTitle} • {completedCount}/{tasks.length} tasks completed
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {transitions.length > 0 && (
                                    <button
                                        onClick={() => generateTransitions(true)}
                                        disabled={isLoading}
                                        title="Regenerate transitions"
                                        style={{
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            color: '#8b5cf6',
                                            cursor: isLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <FaSync size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
                                    </button>
                                )}
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
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Progress */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <span>Task Progress</span>
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
                                        background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                                    <p>Generating task flow insights...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    color: '#f87171'
                                }}>
                                    {error}
                                    <button
                                        onClick={() => generateTransitions(true)}
                                        style={{
                                            display: 'block',
                                            margin: '0.5rem auto 0',
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#f87171',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Task Flow Visualization */}
                            {!isLoading && (
                                <div style={{ position: 'relative' }}>
                                    {tasks.map((task, index) => {
                                        const isLast = index === tasks.length - 1
                                        const transition = !isLast ? getTransition(index) : null

                                        return (
                                            <div key={task.id}>
                                                {/* Task Node */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    padding: '1rem',
                                                    background: task.isCompleted
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : 'rgba(255, 255, 255, 0.03)',
                                                    border: task.isCompleted
                                                        ? '2px solid rgba(34, 197, 94, 0.3)'
                                                        : '1px solid var(--border)',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {/* Node Number */}
                                                    <div style={{
                                                        minWidth: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: task.isCompleted
                                                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                            : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        boxShadow: task.isCompleted
                                                            ? '0 0 20px rgba(34, 197, 94, 0.3)'
                                                            : '0 0 20px rgba(139, 92, 246, 0.3)'
                                                    }}>
                                                        {task.isCompleted ? <FaCheckCircle size={18} /> : index + 1}
                                                    </div>

                                                    {/* Task Content */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            marginBottom: '0.25rem'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '0.125rem 0.5rem',
                                                                borderRadius: '9999px',
                                                                background: task.isCompleted
                                                                    ? 'rgba(34, 197, 94, 0.2)'
                                                                    : 'rgba(139, 92, 246, 0.2)',
                                                                color: task.isCompleted ? '#86efac' : '#a78bfa'
                                                            }}>
                                                                Task {index + 1}
                                                            </span>
                                                            {task.isCompleted && (
                                                                <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>
                                                                    ✓ Completed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 style={{
                                                            fontSize: '1rem',
                                                            fontWeight: 500,
                                                            color: task.isCompleted ? '#86efac' : 'var(--text-main)'
                                                        }}>
                                                            {task.title}
                                                        </h4>
                                                    </div>
                                                </div>

                                                {/* Transition Arrow & Explanation */}
                                                {!isLast && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0.75rem 0',
                                                        paddingLeft: '1.25rem'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            marginRight: '1rem'
                                                        }}>
                                                            <div style={{
                                                                width: '2px',
                                                                height: '20px',
                                                                background: 'linear-gradient(to bottom, #8b5cf6, #ec4899)'
                                                            }} />
                                                            <FaArrowDown size={14} style={{ color: '#ec4899' }} />
                                                        </div>

                                                        {transition && (
                                                            <div style={{
                                                                flex: 1,
                                                                padding: '0.75rem 1rem',
                                                                background: 'rgba(236, 72, 153, 0.1)',
                                                                borderRadius: '8px',
                                                                borderLeft: '3px solid #ec4899'
                                                            }}>
                                                                <p style={{
                                                                    fontSize: '0.8rem',
                                                                    color: 'var(--text-muted)',
                                                                    fontStyle: 'italic',
                                                                    lineHeight: 1.5
                                                                }}>
                                                                    💡 {transition.explanation}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {!transition && transitions.length > 0 && (
                                                            <div style={{
                                                                flex: 1,
                                                                padding: '0.5rem 1rem',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                borderRadius: '8px',
                                                                fontSize: '0.75rem',
                                                                color: 'var(--text-muted)'
                                                            }}>
                                                                Continue to next task...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

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
                                    <FaCircle size={8} style={{ color: '#8b5cf6' }} />
                                    Pending
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle size={10} style={{ color: '#22c55e' }} />
                                    Completed
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaArrowDown size={10} style={{ color: '#ec4899' }} />
                                    Transition
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}
