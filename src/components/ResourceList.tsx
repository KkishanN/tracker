'use client'

import { FaFilePdf, FaEye } from 'react-icons/fa'
import PdfViewer from './PdfViewer'

interface Resource {
    id: string
    title: string
    url: string
    type: string
}

interface ResourceListProps {
    resources: Resource[]
}

export default function ResourceList({ resources }: ResourceListProps) {
    if (resources.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '1rem'
                }}>
                    Resources
                </h3>
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No resources uploaded yet. Click "Upload Resource" above to add PDFs.
                </p>
            </div>
        )
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '1rem'
            }}>
                Resources ({resources.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resources.map((resource) => (
                    <PdfViewer key={resource.id} url={resource.url} title={resource.title}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            className="resource-item"
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaFilePdf size={18} style={{ color: '#ef4444' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    display: 'block'
                                }}>
                                    {resource.title}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Click to view
                                </span>
                            </div>
                            <FaEye size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </PdfViewer>
                ))}
            </div>

            <style jsx>{`
                .resource-item:hover {
                    border-color: rgba(239, 68, 68, 0.4);
                    background: rgba(239, 68, 68, 0.05);
                }
            `}</style>
        </div>
    )
}
