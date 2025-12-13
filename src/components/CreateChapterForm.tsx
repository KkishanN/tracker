'use client'

import { createChapter } from "@/app/actions/chapters"
import { useRef, useState } from "react"
import { FaPlus, FaSpinner } from "react-icons/fa"

export default function CreateChapterForm({ subjectId }: { subjectId: string }) {
    const formRef = useRef<HTMLFormElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            await createChapter(formData)
            formRef.current?.reset()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.5rem',
                marginTop: '1.5rem',
                border: '2px dashed rgba(139, 92, 246, 0.3)',
                background: 'rgba(139, 92, 246, 0.05)'
            }}
        >
            <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <FaPlus size={14} style={{ color: '#8b5cf6' }} />
                Add New Chapter
            </h3>
            <form
                action={handleSubmit}
                ref={formRef}
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <input type="hidden" name="subjectId" value={subjectId} />
                <input
                    type="text"
                    name="title"
                    placeholder="Enter chapter name..."
                    required
                    className="input-field"
                    style={{
                        flex: '1 1 200px',
                        minWidth: '200px'
                    }}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                            Adding...
                        </>
                    ) : (
                        <>
                            <FaPlus size={12} />
                            Add Chapter
                        </>
                    )}
                </button>
            </form>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

