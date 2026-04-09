'use client'

import { useState, useRef, useEffect } from 'react'
import { PROMPTS } from '@/lib/bingo'

interface Props {
  position: number
  promptIndex: number
  onConfirm: (name: string) => Promise<{ error?: string }>
  onClose: () => void
}

export default function MarkModal({ position, promptIndex, onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Enter a name')
      return
    }
    setLoading(true)
    setError('')
    const result = await onConfirm(name.trim())
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#aaa] mb-1">Mark this square</p>
        <h3 className="text-[#1a1a1a] font-semibold text-base mb-5 leading-snug">
          {PROMPTS[promptIndex]}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[#888] text-xs font-semibold tracking-wider uppercase block mb-1.5">
              Who matches this?
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Their name"
              className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#1a1a1a] text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#e5e5e5] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors text-xs font-semibold tracking-wider uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold transition-colors text-xs tracking-wider uppercase disabled:opacity-50"
            >
              {loading ? 'Stamping...' : 'Stamp it'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
