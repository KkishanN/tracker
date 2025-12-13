'use client'

import { useState, useRef, useTransition } from "react"
import { FaCheckCircle, FaCircle, FaRobot, FaPlus, FaTrash } from "react-icons/fa"
import { toggleTask, createTask, deleteTask } from "@/app/actions/tasks"
import TaskFlowMap from "./TaskFlowMap"

interface Task {
    id: string
    description: string
    isCompleted: boolean
}

export default function TaskList({ chapterId, tasks: initialTasks }: { chapterId: string, tasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [newTaskText, setNewTaskText] = useState('')
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)

    const handleToggle = (taskId: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ))

        startTransition(async () => {
            try {
                await toggleTask(taskId)
            } catch (error) {
                // Revert on error
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                ))
            }
        })
    }

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskText.trim()) return

        const tempId = `temp-${Date.now()}`
        const newTask: Task = {
            id: tempId,
            description: newTaskText.trim(),
            isCompleted: false
        }

        // Optimistic update
        setTasks(prev => [...prev, newTask])
        setNewTaskText('')

        const formData = new FormData()
        formData.append('description', newTask.description)
        formData.append('chapterId', chapterId)

        startTransition(async () => {
            try {
                await createTask(formData)
                // The revalidatePath will refresh the page with the real task
            } catch (error) {
                // Remove optimistic task on error
                setTasks(prev => prev.filter(t => t.id !== tempId))
                setNewTaskText(newTask.description)
            }
        })
    }

    const handleDelete = (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId)
        if (!taskToDelete) return

        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskId))

        startTransition(async () => {
            try {
                await deleteTask(taskId)
            } catch (error) {
                // Revert on error
                if (taskToDelete) {
                    setTasks(prev => [...prev, taskToDelete])
                }
            }
        })
    }

    const handleGenerateTasks = async () => {
        // Call AI tasks API
        startTransition(async () => {
            try {
                const res = await fetch('/api/ai/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chapterId })
                })
                if (res.ok) {
                    // Refresh to get new tasks
                    window.location.reload()
                }
            } catch (error) {
                console.error('Failed to generate tasks:', error)
            }
        })
    }

    const completedCount = tasks.filter(t => t.isCompleted).length

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Tasks
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {completedCount}/{tasks.length} completed
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {tasks.length >= 2 && (
                        <TaskFlowMap
                            tasks={tasks.map(t => ({ id: t.id, title: t.description, isCompleted: t.isCompleted }))}
                            chapterTitle="Chapter"
                            chapterId={chapterId}
                        />
                    )}
                    <button
                        onClick={handleGenerateTasks}
                        disabled={isPending}
                        style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#8b5cf6',
                            border: 'none',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.4)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                    >
                        <FaRobot size={12} /> Generate Tasks
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                        No tasks yet. Add one below or generate with AI.
                    </p>
                )}
                {tasks.map(task => (
                    <div
                        key={task.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <button
                            onClick={() => handleToggle(task.id)}
                            disabled={isPending || task.id.startsWith('temp-')}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: task.isCompleted ? '#22c55e' : 'var(--text-muted)',
                                padding: 0,
                                display: 'flex',
                                transition: 'color 0.2s'
                            }}
                        >
                            {task.isCompleted ? <FaCheckCircle size={18} /> : <FaCircle size={18} />}
                        </button>
                        <span style={{
                            flex: 1,
                            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: task.isCompleted ? 'line-through' : 'none',
                            fontSize: '0.875rem'
                        }}>
                            {task.description}
                        </span>
                        {!task.id.startsWith('temp-') && (
                            <button
                                onClick={() => handleDelete(task.id)}
                                disabled={isPending}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '0.25rem',
                                    opacity: 0.5,
                                    transition: 'opacity 0.2s, color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1'
                                    e.currentTarget.style.color = '#f87171'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '0.5'
                                    e.currentTarget.style.color = 'var(--text-muted)'
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Task Form */}
            <form
                ref={formRef}
                onSubmit={handleAddTask}
                style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '0.5rem'
                }}
            >
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="input-field"
                    style={{ flex: 1 }}
                />
                <button
                    type="submit"
                    disabled={isPending || !newTaskText.trim()}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                >
                    <FaPlus size={12} />
                </button>
            </form>
        </div>
    )
}

