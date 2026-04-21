'use client'

import { Mark } from '@/lib/types'
import { WIN_LINES, getCompletedLines } from '@/lib/bingo'
import BingoSquare from './BingoSquare'

interface Props {
  squareOrder: number[]
  marks: Mark[]
  onMarkSquare: (position: number) => void
}

export default function BingoCard({ squareOrder, marks, onMarkSquare }: Props) {
  const marksByPosition = new Map(marks.map(m => [m.square_index, m.matched_name]))
  const markedPositions = new Set(marks.map(m => m.square_index))
  const completedLines = getCompletedLines(markedPositions)

  const highlightedPositions = new Set<number>()
  for (const line of WIN_LINES) {
    if (completedLines.has(line.id)) {
      line.positions.forEach(p => highlightedPositions.add(p))
    }
  }

  return (
    <div className="w-full max-w-[520px]">
      <div className="grid grid-cols-3 gap-[10px]">
        {squareOrder.map((promptIndex, position) => (
          <BingoSquare
            key={position}
            position={position}
            promptIndex={promptIndex}
            markedName={marksByPosition.get(position)}
            isHighlighted={highlightedPositions.has(position)}
            onClick={() => onMarkSquare(position)}
          />
        ))}
      </div>
      {completedLines.size > 0 && (
        <p className="text-center text-[#1a1a1a] font-bold mt-3 text-sm tracking-widest uppercase animate-pulse">
          BINGO! {completedLines.size} line{completedLines.size > 1 ? 's' : ''} complete!
        </p>
      )}
    </div>
  )
}
