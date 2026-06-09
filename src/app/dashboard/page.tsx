'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import GoalsPanel from './components/GoalsPanel'
import GemCounter from './components/GemCounter'

interface Profile {
  username: string
  gems: number
  streak: number
  shields: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [gemBonus, setGemBonus] = useState(0)
  const [bonusKey, setBonusKey] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('username, gems, streak, shields')
        .eq('id', session.user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    init()
  }, [])

  const handleGemsEarned = (amount: number) => {
    setGemBonus(amount)
    setBonusKey(prev => prev + 1)
    setProfile(prev => prev ? { ...prev, gems: prev.gems + amount } : prev)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
        <div className="text-center">
          <p className="font-display text-sm tracking-widest gem-gradient animate-pulse">
            INITIALIZING...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ borderColor: 'var(--border)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)' }}>
        <h1 className="font-display text-xl tracking-widest gem-gradient">DECIPHER</h1>
        <div className="flex items-center gap-3">
          {profile && (
            <>
              <GemCounter key={bonusKey} initial={profile.gems} bonus={gemBonus} />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <span className="text-lg">🔥</span>
                <span className="font-display text-sm" style={{ color: 'var(--streak)' }}>
                  {profile.streak}
                </span>
              </div>
              {profile.shields > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <span className="text-lg">🛡️</span>
                  <span className="font-display text-sm" style={{ color: '#60a5fa' }}>
                    {profile.shields}
                  </span>
                </div>
              )}
              <span className="text-sm hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                {profile.username}
              </span>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="font-display text-xs tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            {today.toUpperCase()}
          </p>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            What are you deciphering today?
          </h2>
        </div>

        <GoalsPanel onGemsEarned={handleGemsEarned} />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="surface-card p-4 opacity-40">
            <p className="font-display text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              POMODORO TIMER
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Coming Day 3</p>
          </div>
          <div className="surface-card p-4 opacity-40">
            <p className="font-display text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              CONSISTENCY GRID
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Coming Day 5</p>
          </div>
        </div>
      </main>
    </div>
  )
}
