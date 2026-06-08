import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-abyss)' }}>
        <h1 className="font-display text-xl tracking-widest gem-gradient">DECIPHER</h1>
        <div className="flex items-center gap-4">
          {/* Gems display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span className="text-lg">💎</span>
            <span className="font-display text-sm" style={{ color: 'var(--gem-bright)' }}>
              {profile?.gems ?? 0}
            </span>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span className="text-lg">🔥</span>
            <span className="font-display text-sm" style={{ color: 'var(--streak)' }}>
              {profile?.streak ?? 0}
            </span>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {profile?.username ?? user.email}
          </span>
        </div>
      </nav>

      {/* Main content placeholder */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="surface-card p-8 text-center">
          <h2 className="font-display text-2xl gem-gradient mb-3">
            Day 1 Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Auth ✓ — DB Schema ✓ — Dashboard shell loading.<br />
            Goals system coming tomorrow.
          </p>
        </div>
      </main>
    </div>
  )
}
