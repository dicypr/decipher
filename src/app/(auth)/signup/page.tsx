'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-card p-10 max-w-md mx-4 text-center"
        >
          <div className="text-4xl mb-4">💎</div>
          <h2 className="font-display text-xl mb-2 gem-gradient">Account created</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Check your email to verify your account, then come back to start earning gems.
          </p>
          <Link href="/login"
            className="inline-block mt-6 px-6 py-3 rounded-lg text-sm font-medium"
            style={{ background: 'var(--gem)', color: '#fff' }}>
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-void)' }}>

      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--gem)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold tracking-wider gem-gradient">
            DECIPHER
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            // your journey begins
          </p>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-lg font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { label: 'Username', value: username, setter: setUsername, type: 'text', placeholder: 'dicypr' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label}>
                <label className="block text-xs mb-2 tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                  style={{
                    background: 'var(--bg-abyss)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gem)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-sm tracking-wider transition-all disabled:opacity-50"
              style={{
                background: 'var(--gem)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.1em',
              }}
            >
              {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--gem-bright)' }} className="hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
