'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'

const CATEGORIES = [
  { id: 'personal', label: 'Personal', color: '#6366f1' },
  { id: 'work', label: 'Work', color: '#f59e0b' },
  { id: 'health', label: 'Health', color: '#10b981' },
  { id: 'learning', label: 'Learning', color: '#3b82f6' },
  { id: 'other', label: 'Other', color: '#94a3b8' },
]

interface Goal {
  id: string
  title: string
  completed: boolean
  category: string
  date: string
}

interface GoalsPanelProps {
  onGemsEarned: (amount: number) => void
}

export default function GoalsPanel({ onGemsEarned }: GoalsPanelProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('personal')
  const [adding, setAdding] = useState(false)
  const [today] = useState(new Date().toISOString().split('T')[0])

  const fetchGoals = useCallback(async () => {
    const res = await fetch(`/api/goals?date=${today}`)
    const data = await res.json()
    setGoals(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [today])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const addGoal = async () => {
    if (!input.trim() || adding) return
    setAdding(true)

    // Optimistic update
    const temp: Goal = { id: 'temp', title: input.trim(), completed: false, category, date: today }
    setGoals(prev => [...prev, temp])
    setInput('')

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input.trim(), date: today, category }),
    })
    const data = await res.json()
    setGoals(prev => prev.map(g => g.id === 'temp' ? data : g))
    setAdding(false)
  }

  const toggleGoal = async (goal: Goal) => {
    const newCompleted = !goal.completed

    // Optimistic update
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: newCompleted } : g))

    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goal.id, completed: newCompleted }),
    })

    if (newCompleted) onGemsEarned(10)
  }

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
  }

  const completed = goals.filter(g => g.completed).length
  const total = goals.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  const getCategoryColor = (id: string) =>
    CATEGORIES.find(c => c.id === id)?.color ?? '#94a3b8'

  return (
    <div className="surface-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-sm tracking-widest" style={{ color: 'var(--text-muted)' }}>
            TODAY'S GOALS
          </h2>
          <p className="text-2xl font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {completed}/{total} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>completed</span>
          </p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <span className="font-display text-xs" style={{ color: 'var(--gem-bright)' }}>
              +{completed * 10} 💎
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--gem), var(--gem-glow))' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Add goal input */}
      <div className="mb-5">
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            placeholder="Add a goal for today..."
            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
            style={{
              background: 'var(--bg-abyss)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gem)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={addGoal}
            disabled={!input.trim() || adding}
            className="px-3 py-2.5 rounded-lg transition-all disabled:opacity-40"
            style={{ background: 'var(--gem)', color: '#fff' }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Category selector */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="px-2.5 py-1 rounded-md text-xs transition-all"
              style={{
                background: category === cat.id ? cat.color + '33' : 'var(--bg-abyss)',
                border: `1px solid ${category === cat.id ? cat.color : 'var(--border)'}`,
                color: category === cat.id ? cat.color : 'var(--text-muted)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p className="font-display text-xs tracking-widest">NO GOALS YET</p>
          <p className="text-sm mt-1">Add your first goal above</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {goals.map(goal => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleGoal(goal)}
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: goal.completed ? 'var(--success)' : 'transparent',
                    border: `2px solid ${goal.completed ? 'var(--success)' : 'var(--border-bright)'}`,
                  }}
                >
                  {goal.completed && <Check size={12} color="#fff" strokeWidth={3} />}
                </button>

                {/* Category dot */}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: getCategoryColor(goal.category) }} />

                {/* Title */}
                <span className="flex-1 text-sm"
                  style={{
                    color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: goal.completed ? 'line-through' : 'none',
                  }}>
                  {goal.title}
                </span>

                {/* Gem reward indicator */}
                {goal.completed && (
                  <span className="text-xs font-display" style={{ color: 'var(--gem-bright)' }}>+10💎</span>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
