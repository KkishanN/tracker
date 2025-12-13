'use client'

import { useState } from 'react'
import { FaTrash, FaSpinner, FaTimes } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface DeleteChapterButtonProps {
    chapterId: string
    chapterTitle: string
    subjectId: string
}

export default function DeleteChapterButton({ chapterId, chapterTitle, subjectId }: DeleteChapterButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/chapters/${chapterId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.push(`/dashboard/subjects/${subjectId}`)
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete chapter')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete chapter')
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
            >
                <FaTrash size={12} />
                Delete
            </button>

            {showConfirm && (
                <div
                    className="modal-overlay"
                    onClick={() => !isDeleting && setShowConfirm(false)}
                >
                    <div
                        className="modal-content animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '400px' }}
                    >
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ef4444' }}>
                                Delete Chapter
                            </h2>
                            <button
                                onClick={() => !isDeleting && setShowConfirm(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                                Are you sure you want to delete <strong>"{chapterTitle}"</strong>?
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                This will also delete all tasks and resources in this chapter. This action cannot be undone.
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: isDeleting ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                {isDeleting ? (
                                    <>
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FaTrash size={12} />
                                        Delete
                                    </>
                                )}
                            </button>
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
