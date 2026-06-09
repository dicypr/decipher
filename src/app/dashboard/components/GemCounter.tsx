'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GemCounterProps {
  initial: number
  bonus?: number
}

export default function GemCounter({ initial, bonus = 0 }: GemCounterProps) {
  const [gems, setGems] = useState(initial)
  const [showBonus, setShowBonus] = useState(false)
  const [bonusAmount, setBonusAmount] = useState(0)

  useEffect(() => {
    if (bonus > 0) {
      setGems(prev => prev + bonus)
      setBonusAmount(bonus)
      setShowBonus(true)
      setTimeout(() => setShowBonus(false), 1500)
    }
  }, [bonus])

  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <motion.span
        key={gems}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-lg"
      >
        💎
      </motion.span>
      <motion.span
        key={`gems-${gems}`}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-sm"
        style={{ color: 'var(--gem-bright)' }}
      >
        {gems}
      </motion.span>

      {/* Floating bonus indicator */}
      <AnimatePresence>
        {showBonus && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-display whitespace-nowrap"
            style={{ color: 'var(--gem-bright)' }}
          >
            +{bonusAmount}💎
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
