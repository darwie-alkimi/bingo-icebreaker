export const PROMPTS: string[] = [
  'Lived in a different country outside of England',
  'Reels feed is filled with AI memes',
  'Spends too much money on AI subscriptions',
  'Taught their parents how to use AI',
  'Works in a startup',
  'Ran a marathon',
  'Set up their own OpenClaw agent',
  'Rewatched the same show 3+ times',
  'Loves pineapple on pizza',
]

// Win lines for a 3x3 grid (positions 0-8)
export const WIN_LINES: { id: string; positions: number[] }[] = [
  { id: 'row_0', positions: [0, 1, 2] },
  { id: 'row_1', positions: [3, 4, 5] },
  { id: 'row_2', positions: [6, 7, 8] },
  { id: 'col_0', positions: [0, 3, 6] },
  { id: 'col_1', positions: [1, 4, 7] },
  { id: 'col_2', positions: [2, 5, 8] },
  { id: 'diag_main', positions: [0, 4, 8] },
  { id: 'diag_anti', positions: [2, 4, 6] },
]

export function shuffleCard(): number[] {
  const indices = Array.from({ length: 9 }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export function getCompletedLines(markedPositions: Set<number>): Set<string> {
  const completed = new Set<string>()
  for (const line of WIN_LINES) {
    if (line.positions.every(p => markedPositions.has(p))) {
      completed.add(line.id)
    }
  }
  return completed
}
