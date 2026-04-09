'use client'

import { Winner } from '@/lib/types'

interface Props {
  winners: Winner[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_LABELS = ['1st', '2nd', '3rd']

export default function Podium({ winners }: Props) {
  const podiumWinners = winners
    .filter(w => w.podiumRank !== null)
    .sort((a, b) => (a.podiumRank ?? 99) - (b.podiumRank ?? 99))
    .filter((w, _, arr) => arr.findIndex(x => x.playerId === w.playerId) === arr.indexOf(w))
    .slice(0, 3)

  if (podiumWinners.length === 0) return null

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
      <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#aaa] mb-3 text-center">
        Leaderboard
      </p>
      <div className="space-y-2">
        {podiumWinners.map(winner => {
          const rank = (winner.podiumRank ?? 1) - 1
          return (
            <div
              key={`${winner.playerId}-${winner.lineType}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f7f7f7] border border-[#e5e5e5]"
            >
              <span className="text-xl">{MEDALS[rank]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1a1a1a] truncate">{winner.playerName}</p>
                <p className="text-[11px] text-[#aaa] tracking-wider uppercase">{RANK_LABELS[rank]} to BINGO</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
