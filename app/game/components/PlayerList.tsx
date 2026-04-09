'use client'

import { Player } from '@/lib/types'

interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerList({ players, currentPlayerId }: Props) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
      <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#aaa] mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
        Live Players ({players.length})
      </p>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {players.map(player => (
          <li
            key={player.id}
            className={`text-sm px-2 py-1.5 rounded-lg flex items-center gap-2 ${
              player.id === currentPlayerId
                ? 'bg-[#f7f7f7] text-[#1a1a1a] font-semibold'
                : 'text-[#666]'
            }`}
          >
            {player.name}
            {player.id === currentPlayerId && (
              <span className="text-[10px] text-[#aaa] ml-auto font-normal tracking-wider uppercase">you</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
