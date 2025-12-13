import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        // Use database strategy for persistent sessions
        strategy: "database",
        // Session will last 30 days
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        // Extend session when user is active
        updateAge: 24 * 60 * 60, // Update session every 24 hours
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // Cookie expires in 30 days
                maxAge: 30 * 24 * 60 * 60,
            },
        },
    },
    callbacks: {
        session: async ({ session, user }) => {
            if (session?.user && user?.id) {
                // @ts-ignore
                session.user.id = user.id
            }
            return session
        },
    },
    pages: {
        signIn: '/',
        error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
}
