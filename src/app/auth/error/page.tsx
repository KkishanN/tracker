'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'
import { Suspense } from 'react'

const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration. Check if environment variables are set correctly.',
    AccessDenied: 'Access was denied. You may need to verify your email or use a different account.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error starting the OAuth sign-in flow. Check Google Client ID and Secret.',
    OAuthCallback: 'Error during the OAuth callback. The callback URL may be misconfigured.',
    OAuthCreateAccount: 'Could not create user account. There may be a database connection issue.',
    EmailCreateAccount: 'Could not create user account via email.',
    Callback: 'Error in the OAuth callback handler.',
    OAuthAccountNotLinked: 'This email is already associated with another provider.',
    EmailSignin: 'Error sending the verification email.',
    CredentialsSignin: 'Invalid credentials. Check your username and password.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An unexpected authentication error occurred.',
}

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error') || 'Default'
    const errorMessage = errorMessages[error] || errorMessages.Default

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div
                className="glass-panel"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '2rem',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <FaExclamationTriangle size={28} style={{ color: '#f87171' }} />
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Authentication Error
                </h1>

                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    Error code: <code style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px'
                    }}>{error}</code>
                </p>

                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '2rem',
                    lineHeight: 1.6
                }}>
                    {errorMessage}
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link
                        href="/"
                        className="btn-primary"
                    >
                        <FaHome size={14} />
                        Try Again
                    </Link>
                </div>

                <p style={{
                    marginTop: '2rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1rem'
                }}>
                    Make sure your <code>.env</code> file contains:<br />
                    <code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code>,<br />
                    <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>
                </p>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}
