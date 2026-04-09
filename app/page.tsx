'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket'

export default function JoinPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Enter your name to join')
      return
    }

    setLoading(true)
    setError('')

    const socket = getSocket()

    socket.emit('join', { name: name.trim() }, (res: {
      error?: string
      playerId?: string
      squareOrder?: number[]
    }) => {
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      sessionStorage.setItem('bingo_player_id', res.playerId!)
      sessionStorage.setItem('bingo_player_name', name.trim())
      sessionStorage.setItem('bingo_square_order', JSON.stringify(res.squareOrder!))

      router.push('/game')
    })
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1
            className="text-5xl text-[#1a1a1a] leading-tight mb-3"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            AI Maxxing Bingo
          </h1>
          <p className="text-[#888] text-sm">
            Find someone who matches each square.<br />
            First to complete a line wins!
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-3">
          <div>
            <label className="block text-[#888] text-xs font-semibold tracking-[1.5px] uppercase mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              autoFocus
              className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#1a1a1a] text-base"
            />
            {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>

        <p className="text-center text-[#bbb] text-xs mt-8 tracking-wider uppercase">
          No code needed — everyone joins the same session
        </p>
      </div>
    </div>
  )
}
