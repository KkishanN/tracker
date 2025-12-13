/**
 * @jest-environment node
 */

// Mock dependencies before importing modules
jest.mock('@/lib/prisma', () => ({
    prisma: {
        chapter: {
            create: jest.fn(),
            findFirst: jest.fn(),
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

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Import after mocks
import { createChapter } from '../chapters'

describe('createChapter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return early when user is not authenticated', async () => {
        ; (getServerSession as jest.Mock).mockResolvedValue(null)

        const formData = new FormData()
        formData.append('title', 'Test Chapter')
        formData.append('subjectId', 'subject-123')

        await createChapter(formData)

        expect(prisma.chapter.create).not.toHaveBeenCalled()
    })

    it('should create chapter with valid data', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.chapter.create as jest.Mock).mockResolvedValue({
                id: 'chapter-123',
                title: 'Test Chapter',
                subjectId: 'subject-123',
            })

        const formData = new FormData()
        formData.append('title', 'Test Chapter')
        formData.append('subjectId', 'subject-123')

        await createChapter(formData)

        expect(prisma.chapter.create).toHaveBeenCalledWith({
            data: {
                title: 'Test Chapter',
                subjectId: 'subject-123',
            },
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/subjects/subject-123')
    })

    it('should return early if title is missing', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)

        const formData = new FormData()
        formData.append('title', '')
        formData.append('subjectId', 'subject-123')

        await createChapter(formData)

        expect(prisma.chapter.create).not.toHaveBeenCalled()
    })

    it('should return early if subjectId is missing', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)

        const formData = new FormData()
        formData.append('title', 'Test Chapter')
        formData.append('subjectId', '')

        await createChapter(formData)

        expect(prisma.chapter.create).not.toHaveBeenCalled()
    })
})
