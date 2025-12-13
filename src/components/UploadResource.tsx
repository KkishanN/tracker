'use client'

import { useState, useRef } from 'react'
import { FaUpload, FaTimes, FaFilePdf, FaSpinner, FaCheck } from 'react-icons/fa'

interface UploadResourceProps {
    chapterId: string
    onUploadComplete?: () => void
}

export default function UploadResource({ chapterId, onUploadComplete }: UploadResourceProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are supported')
                return
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB')
                return
            }
            setSelectedFile(file)
            setTitle(file.name.replace('.pdf', ''))
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !title.trim()) return

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('title', title.trim())
            formData.append('chapterId', chapterId)

            const res = await fetch('/api/resources/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Upload failed')
            }

            setSuccess(true)
            setTimeout(() => {
                setIsOpen(false)
                setSuccess(false)
                setSelectedFile(null)
                setTitle('')
                onUploadComplete?.()
                window.location.reload()
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setSelectedFile(null)
        setTitle('')
        setError(null)
        setSuccess(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
                <FaUpload size={14} />
                Upload Resource
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div
                        className="modal-content animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                Upload PDF Resource
                            </h2>
                            <button
                                onClick={handleClose}
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
                            {success ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: '#22c55e'
                                }}>
                                    <FaCheck size={48} style={{ marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                        Upload Successful!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* File Drop Zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: '2px dashed var(--border)',
                                            borderRadius: '12px',
                                            padding: '2rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            marginBottom: '1.5rem',
                                            transition: 'border-color 0.2s',
                                            background: selectedFile ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".pdf"
                                            style={{ display: 'none' }}
                                        />
                                        {selectedFile ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                                <FaFilePdf size={24} style={{ color: '#ef4444' }} />
                                                <span style={{ color: 'var(--text-main)' }}>{selectedFile.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaUpload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Click to select a PDF file
                                                </p>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    Max size: 10MB
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Title Input */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            Resource Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter a title for this resource"
                                            className="input-field"
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {/* Error Message */}
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

                                    {/* Upload Button */}
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || !title.trim() || isUploading}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            opacity: (!selectedFile || !title.trim() || isUploading) ? 0.5 : 1
                                        }}
                                    >
                                        {isUploading ? (
                                            <>
                                                <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload size={14} />
                                                Upload PDF
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
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
