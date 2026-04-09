'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import { getCompletedLines } from '@/lib/bingo'
import { Mark, Player, Winner } from '@/lib/types'
import BingoCard from './components/BingoCard'
import MarkModal from './components/MarkModal'
import PlayerList from './components/PlayerList'
import Podium from './components/Podium'
import BingoCelebration from './components/BingoCelebration'

export default function GameClient() {
  const router = useRouter()

  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [squareOrder, setSquareOrder] = useState<number[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [modalPosition, setModalPosition] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [loading, setLoading] = useState(true)

  const prevCompletedLines = useRef<Set<string>>(new Set())
  const currentPlayerId = useRef<string | null>(null)

  useEffect(() => {
    const pid = sessionStorage.getItem('bingo_player_id')
    const pname = sessionStorage.getItem('bingo_player_name')
    const order = sessionStorage.getItem('bingo_square_order')

    if (!pid || !pname || !order) {
      router.replace('/')
      return
    }

    currentPlayerId.current = pid
    setPlayerId(pid)
    setPlayerName(pname)
    setSquareOrder(JSON.parse(order))

    const socket = getSocket()

    socket.emit('rejoin', { playerId: pid }, (res: {
      error?: string
      squareOrder?: number[]
      marks?: { square_index: number; matched_name: string }[]
      state?: { players: Player[]; winners: Winner[] }
    }) => {
      if (res.error) {
        sessionStorage.clear()
        router.replace('/')
        return
      }

      if (res.squareOrder) setSquareOrder(res.squareOrder)

      if (res.marks) {
        const hydratedMarks: Mark[] = res.marks.map((m, i) => ({
          id: String(i),
          card_id: pid,
          square_index: m.square_index,
          matched_name: m.matched_name,
          created_at: '',
        }))
        setMarks(hydratedMarks)
        const positions = new Set(hydratedMarks.map(m => m.square_index))
        prevCompletedLines.current = getCompletedLines(positions)
      }

      if (res.state) {
        setPlayers(res.state.players)
        setWinners(res.state.winners)
      }

      setLoading(false)
    })

    socket.on('player_joined', (player: Player) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === player.id)) return prev
        return [...prev, player]
      })
    })

    socket.on('player_left', (leftId: string) => {
      setPlayers(prev => prev.filter(p => p.id !== leftId))
    })

    socket.on('mark_update', ({ playerId: fromId, squareIndex, matchedName }: {
      playerId: string; squareIndex: number; matchedName: string
    }) => {
      if (fromId !== currentPlayerId.current) return
      setMarks(prev => {
        if (prev.find(m => m.square_index === squareIndex)) return prev
        return [...prev, { id: String(Date.now()), card_id: fromId, square_index: squareIndex, matched_name: matchedName, created_at: new Date().toISOString() }]
      })
    })

    socket.on('new_winner', (winner: Winner) => {
      setWinners(prev => [...prev, winner])
      if (winner.playerId === currentPlayerId.current) setShowCelebration(true)
    })

    return () => {
      socket.off('player_joined')
      socket.off('player_left')
      socket.off('mark_update')
      socket.off('new_winner')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkSquare = useCallback(async (name: string): Promise<{ error?: string }> => {
    if (modalPosition === null) return { error: 'Something went wrong' }

    return new Promise(resolve => {
      const socket = getSocket()
      socket.emit('mark', { squareIndex: modalPosition, matchedName: name }, (res: { ok?: boolean; error?: string }) => {
        if (res.error) { resolve({ error: res.error }); return }

        const newMark: Mark = {
          id: String(Date.now()),
          card_id: currentPlayerId.current!,
          square_index: modalPosition,
          matched_name: name,
          created_at: new Date().toISOString(),
        }

        setMarks(prev => {
          const updated = [...prev, newMark]
          const positions = new Set(updated.map(m => m.square_index))
          const nowCompleted = getCompletedLines(positions)
          const hasNewLine = Array.from(nowCompleted).some(l => !prevCompletedLines.current.has(l))
          if (hasNewLine) prevCompletedLines.current = nowCompleted
          return updated
        })

        resolve({})
      })
    })
  }, [modalPosition])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#aaa] text-sm tracking-wider uppercase">Loading your card...</div>
      </div>
    )
  }

  const markedCount = marks.length
  const completedLines = getCompletedLines(new Set(marks.map(m => m.square_index)))
  const hasBingo = completedLines.size > 0
  const selectedPromptIndex = modalPosition !== null ? squareOrder[modalPosition] : 0

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            AI Maxxing Bingo
          </h1>
          <p className="text-[#aaa] text-sm mt-1">
            Playing as <span className="text-[#1a1a1a] font-semibold">{playerName}</span>
          </p>

          <div className="inline-flex items-center gap-4 mt-4 px-6 py-2.5 bg-white border border-[#e5e5e5] rounded-full">
            <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#aaa]">Stamped</span>
            <span className="text-2xl text-[#1a1a1a] leading-none" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {markedCount}
            </span>
            <span className="w-px h-5 bg-[#e5e5e5]" />
            <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#aaa]">/ 16</span>
            {hasBingo && (
              <>
                <span className="w-px h-5 bg-[#e5e5e5]" />
                <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#1a1a1a] animate-pulse">BINGO!</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className="w-full lg:flex-1 flex justify-center">
            <BingoCard
              squareOrder={squareOrder}
              marks={marks}
              onMarkSquare={pos => setModalPosition(pos)}
            />
          </div>
          <div className="w-full lg:w-64 flex flex-col gap-4">
            <PlayerList players={players} currentPlayerId={playerId!} />
            <Podium winners={winners} />
          </div>
        </div>

        <p className="text-center text-[#bbb] text-xs mt-6 tracking-wider uppercase">
          Tap a square · enter who matches · get a line to win
        </p>
      </div>

      {modalPosition !== null && (
        <MarkModal
          position={modalPosition}
          promptIndex={selectedPromptIndex}
          onConfirm={handleMarkSquare}
          onClose={() => setModalPosition(null)}
        />
      )}

      {showCelebration && (
        <BingoCelebration onDismiss={() => setShowCelebration(false)} />
      )}
    </div>
  )
}
