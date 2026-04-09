'use client'

import { PROMPTS } from '@/lib/bingo'

interface Props {
  position: number
  promptIndex: number
  markedName?: string
  isHighlighted: boolean
  onClick: () => void
}

export default function BingoSquare({ promptIndex, markedName, isHighlighted, onClick }: Props) {
  const isMarked = !!markedName
  const prompt = PROMPTS[promptIndex]

  return (
    <button
      onClick={isMarked ? undefined : onClick}
      disabled={isMarked}
      className={`
        relative flex flex-col items-center justify-center p-2 rounded-[14px] border text-center
        transition-all duration-200 min-h-[90px] sm:min-h-[110px] select-none
        ${isMarked
          ? isHighlighted
            ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white cursor-default ring-2 ring-[#1a1a1a] ring-offset-2'
            : 'bg-[#1a1a1a] border-[#1a1a1a] text-white cursor-default'
          : 'bg-white border-[#e5e5e5] text-[#444] hover:border-[#ccc] hover:bg-[#f7f7f7] hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
        }
      `}
    >
      {isMarked ? (
        <>
          <span className="text-[10px] font-medium leading-snug opacity-60 mb-1">{prompt}</span>
          <span className="text-xs font-bold">✓ {markedName}</span>
        </>
      ) : (
        <span className="text-[11px] sm:text-[13px] font-medium leading-snug">{prompt}</span>
      )}
    </button>
  )
}
