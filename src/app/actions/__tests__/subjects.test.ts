/**
 * @jest-environment node
 */

// Mock dependencies before importing modules
jest.mock('@/lib/prisma', () => ({
    prisma: {
        subject: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        chapter: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}))

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
    authOptions: {},
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Import after mocks
import { createSubject } from '../subjects'

describe('createSubject', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should throw error when user is not authenticated', async () => {
        ; (getServerSession as jest.Mock).mockResolvedValue(null)

        const formData = new FormData()
        formData.append('title', 'Test Subject')

        await expect(createSubject(formData)).rejects.toThrow('Unaothorized')
    })

    it('should create subject with valid data', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.subject.create as jest.Mock).mockResolvedValue({
                id: 'subject-123',
                title: 'Test Subject',
                description: 'Test Description',
                userId: 'user-123',
            })

        const formData = new FormData()
        formData.append('title', 'Test Subject')
        formData.append('description', 'Test Description')

        await createSubject(formData)

        expect(prisma.subject.create).toHaveBeenCalledWith({
            data: {
                title: 'Test Subject',
                description: 'Test Description',
                userId: 'user-123',
            },
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/subjects')
        expect(redirect).toHaveBeenCalledWith('/dashboard/subjects')
    })

    it('should return early if title is empty', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)

        const formData = new FormData()
        formData.append('title', '')

        await createSubject(formData)

        expect(prisma.subject.create).not.toHaveBeenCalled()
    })
})
