'use client'

import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa"

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
        >
            <FaGoogle />
            <span>Continue with Google</span>
        </button>
    )
}
