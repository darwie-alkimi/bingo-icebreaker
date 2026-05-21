export const PROMPTS: string[] = [
  'Lived in a different country outside of Australia',
  'Reels feed is filled with AI memes',
  'Spends too much money on AI subscriptions',
  'Taught their parents how to use AI',
  'Works in a startup',
  'Is training for a marathon',
  'Set up their own OpenClaw agent',
  'Rewatched the same show twice or more',
  'Loves pineapple on pizza',
  'Regularly goes to karaoke with colleagues',
  'Is a Richmond Tigers fan',
  'Has a favourite rooftop bar',
  'Pays for a Claude Max plan',
  'Listens to AI podcasts on the way to work',
  'Is learning to post content',
  'Wakes up at 5am',
]

// Win lines for a 4x4 grid (positions 0-15)
export const WIN_LINES: { id: string; positions: number[] }[] = [
  { id: 'row_0', positions: [0, 1, 2, 3] },
  { id: 'row_1', positions: [4, 5, 6, 7] },
  { id: 'row_2', positions: [8, 9, 10, 11] },
  { id: 'row_3', positions: [12, 13, 14, 15] },
  { id: 'col_0', positions: [0, 4, 8, 12] },
  { id: 'col_1', positions: [1, 5, 9, 13] },
  { id: 'col_2', positions: [2, 6, 10, 14] },
  { id: 'col_3', positions: [3, 7, 11, 15] },
  { id: 'diag_main', positions: [0, 5, 10, 15] },
  { id: 'diag_anti', positions: [3, 6, 9, 12] },
]

export function shuffleCard(): number[] {
  const indices = Array.from({ length: 16 }, (_, i) => i)
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
