'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  onDismiss: () => void
}

export default function BingoCelebration({ onDismiss }: Props) {
  useEffect(() => {
    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1a1a1a', '#888', '#ccc', '#444', '#e5e5e5'],
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1a1a1a', '#888', '#ccc', '#444', '#e5e5e5'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    const timer = setTimeout(onDismiss, duration + 500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onDismiss}
    >
      <div className="text-center px-10 py-12 bg-white rounded-2xl border border-[#e5e5e5] shadow-2xl max-w-sm mx-4">
        <div className="text-6xl mb-5">🎉</div>
        <p className="text-[11px] font-semibold tracking-[3px] uppercase text-[#aaa] mb-2">You got a line!</p>
        <h2 className="font-serif text-5xl text-[#1a1a1a] mb-1">BINGO</h2>
        <p className="text-[#aaa] text-xs mt-5 tracking-wider uppercase">Tap to dismiss</p>
      </div>
    </div>
  )
}
