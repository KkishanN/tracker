/**
 * @jest-environment node
 */

// Mock dependencies before importing modules
jest.mock('@/lib/prisma', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        chapter: {
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
import { createTask, toggleTask, deleteTask } from '../tasks'

describe('createTask', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should throw error when user is not authenticated', async () => {
        ; (getServerSession as jest.Mock).mockResolvedValue(null)

        const formData = new FormData()
        formData.append('description', 'Test Task')
        formData.append('chapterId', 'chapter-123')

        await expect(createTask(formData)).rejects.toThrow('Unauthorized')
    })

    it('should throw error when chapter not found', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.chapter.findFirst as jest.Mock).mockResolvedValue(null)

        const formData = new FormData()
        formData.append('description', 'Test Task')
        formData.append('chapterId', 'chapter-123')

        await expect(createTask(formData)).rejects.toThrow('Chapter not found')
    })

    it('should create task with valid data', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.chapter.findFirst as jest.Mock).mockResolvedValue({
                id: 'chapter-123',
                subjectId: 'subject-123',
            })
            ; (prisma.task.create as jest.Mock).mockResolvedValue({
                id: 'task-123',
                description: 'Test Task',
                chapterId: 'chapter-123',
                isCompleted: false,
            })

        const formData = new FormData()
        formData.append('description', 'Test Task')
        formData.append('chapterId', 'chapter-123')

        await createTask(formData)

        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                description: 'Test Task',
                chapterId: 'chapter-123',
            },
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/chapters/chapter-123')
    })
})

describe('toggleTask', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should throw error when user is not authenticated', async () => {
        ; (getServerSession as jest.Mock).mockResolvedValue(null)

        await expect(toggleTask('task-123')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when task not found', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.task.findFirst as jest.Mock).mockResolvedValue(null)

        await expect(toggleTask('task-123')).rejects.toThrow('Task not found')
    })

    it('should toggle task completion status', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.task.findFirst as jest.Mock).mockResolvedValue({
                id: 'task-123',
                isCompleted: false,
                chapterId: 'chapter-123',
                chapter: { id: 'chapter-123' },
            })

        await toggleTask('task-123')

        expect(prisma.task.update).toHaveBeenCalledWith({
            where: { id: 'task-123' },
            data: { isCompleted: true },
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/chapters/chapter-123')
    })
})

describe('deleteTask', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should throw error when user is not authenticated', async () => {
        ; (getServerSession as jest.Mock).mockResolvedValue(null)

        await expect(deleteTask('task-123')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when task not found', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.task.findFirst as jest.Mock).mockResolvedValue(null)

        await expect(deleteTask('task-123')).rejects.toThrow('Task not found')
    })

    it('should delete task', async () => {
        const mockUser = { user: { id: 'user-123' } }
            ; (getServerSession as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.task.findFirst as jest.Mock).mockResolvedValue({
                id: 'task-123',
                chapterId: 'chapter-123',
            })

        await deleteTask('task-123')

        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: { id: 'task-123' },
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/chapters/chapter-123')
    })
})
