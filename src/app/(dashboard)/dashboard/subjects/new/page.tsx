'use client'

import { createSubject } from "@/app/actions/subjects"
import { useState } from "react"
import { FaBook, FaSpinner, FaArrowLeft } from "react-icons/fa"
import Link from "next/link"

export default function NewSubjectPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            await createSubject(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding: '1rem'
        }}>
            {/* Back Link */}
            <Link
                href="/dashboard/subjects"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    marginBottom: '2rem',
                    padding: '0.5rem 0'
                }}
            >
                <FaArrowLeft size={12} />
                Back to Subjects
            </Link>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                }}>
                    <FaBook size={30} style={{ color: 'white' }} />
                </div>
                <h1 className="gradient-text" style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem'
                }}>
                    Create New Subject
                </h1>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: 1.5
                }}>
                    Add a new subject to organize your learning journey
                </p>
            </div>

            {/* Form */}
            <form
                action={handleSubmit}
                className="glass-panel"
                style={{
                    padding: '2rem',
                    borderRadius: '16px'
                }}
            >
                <div style={{ marginBottom: '1.75rem' }}>
                    <label
                        htmlFor="title"
                        style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            marginBottom: '0.625rem'
                        }}
                    >
                        Subject Title <span style={{ color: '#8b5cf6' }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        placeholder="e.g. Advanced Calculus, Machine Learning..."
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label
                        htmlFor="description"
                        style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            marginBottom: '0.625rem'
                        }}
                    >
                        Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        placeholder="What will you learn in this subject? Add a brief description..."
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '120px',
                            transition: 'all 0.2s'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '1rem',
                        background: isSubmitting
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                            Creating Subject...
                        </>
                    ) : (
                        'Create Subject'
                    )}
                </button>
            </form>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input:focus, textarea:focus {
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.05);
                }
            `}</style>
        </div>
    )
}
