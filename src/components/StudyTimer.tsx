'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa'

interface StudyTimerProps {
    chapterId: string
    onSessionEnd?: (duration: number) => void
}

export default function StudyTimer({ chapterId, onSessionEnd }: StudyTimerProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [showMeow, setShowMeow] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastMeowMinute = useRef(0)

    // Play meow sound every 5 minutes
    useEffect(() => {
        const currentMinute = Math.floor(seconds / 60)
        if (isRunning && currentMinute > 0 && currentMinute % 5 === 0 && currentMinute !== lastMeowMinute.current) {
            lastMeowMinute.current = currentMinute
            playMeow()
        }
    }, [seconds, isRunning])

    const playMeow = () => {
        setShowMeow(true)
        setTimeout(() => setShowMeow(false), 2000)

        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2)

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.3)
        } catch (e) {
            console.log('Audio not available')
        }
    }

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning])

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        setIsRunning(true)
        lastMeowMinute.current = Math.floor(seconds / 60)
    }

    const handlePause = () => {
        setIsRunning(false)
    }

    const handleStop = async () => {
        setIsRunning(false)

        if (seconds > 0) {
            setIsSaving(true)
            try {
                const minutes = Math.ceil(seconds / 60)
                const res = await fetch('/api/study/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chapterId,
                        duration: minutes
                    })
                })

                if (res.ok) {
                    onSessionEnd?.(minutes)
                }
            } catch (error) {
                console.error('Failed to save session:', error)
            } finally {
                setIsSaving(false)
            }
        }

        setSeconds(0)
        lastMeowMinute.current = 0
    }

    return (
        <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Cat Animation */}
            <div style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '120px',
                height: '120px',
                opacity: isRunning ? 0.3 : 0.1,
                transition: 'opacity 0.5s ease',
                pointerEvents: 'none'
            }}>
                <img
                    src="/cat_reading.png"
                    alt="Study Cat"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        animation: isRunning ? 'catBounce 2s ease-in-out infinite' : 'none'
                    }}
                />
            </div>

            {/* Meow Bubble */}
            {showMeow && (
                <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '20px',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#333',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    animation: 'fadeInOut 2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 10
                }}>
                    🐱 Meow! 5 mins!
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isRunning
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isRunning
                        ? '0 0 20px rgba(34, 197, 94, 0.4)'
                        : '0 0 20px rgba(139, 92, 246, 0.3)'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>🐱</span>
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Study Timer
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isRunning ? 'Kitty is studying with you!' : 'Start studying with kitty!'}
                    </p>
                </div>
            </div>

            {/* Timer Display */}
            <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                textAlign: 'center',
                padding: '1.5rem',
                background: isRunning
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))'
                    : 'rgba(0,0,0,0.3)',
                borderRadius: '16px',
                color: isRunning ? '#22c55e' : 'var(--text-main)',
                marginBottom: '1rem',
                letterSpacing: '0.1em',
                border: isRunning ? '2px solid rgba(34, 197, 94, 0.3)' : '2px solid transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1
            }}>
                {formatTime(seconds)}
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        <FaPlay size={12} />
                        {seconds > 0 ? 'Resume' : 'Start Study'}
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                        }}
                    >
                        <FaPause size={12} />
                        Pause
                    </button>
                )}

                {seconds > 0 && (
                    <button
                        onClick={handleStop}
                        disabled={isSaving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            color: '#ef4444',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            opacity: isSaving ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaStop size={12} />
                        {isSaving ? 'Saving...' : 'Stop'}
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes catBounce {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-8px) rotate(5deg); }
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: scale(0.8); }
                    20% { opacity: 1; transform: scale(1); }
                    80% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.8); }
                }
            `}</style>
        </div>
    )
}
