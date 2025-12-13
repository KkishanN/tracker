'use client'

import { useState } from 'react'
import { FaTimes, FaExternalLinkAlt, FaExpand } from 'react-icons/fa'

interface PdfViewerProps {
    url: string
    title: string
    children: React.ReactNode
}

export default function PdfViewer({ url, title, children }: PdfViewerProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
                {children}
            </div>

            {isOpen && (
                <div
                    className="modal-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '90vw',
                            maxWidth: '1100px',
                            height: '90vh',
                            background: 'var(--bg-dark)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.03)'
                        }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--text-main)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60%'
                            }}>
                                {title}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#8b5cf6',
                                        fontSize: '0.8rem',
                                        textDecoration: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaExternalLinkAlt size={10} />
                                    Open in New Tab
                                </a>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div style={{ flex: 1, background: '#1a1a1a' }}>
                            <iframe
                                src={url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title={title}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
