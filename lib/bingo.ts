export const PROMPTS: string[] = [
  'Has set up their own AI/Claude agent',
  'Uses Claude for work',
  'Works in a startup',
  'Has done angel investing',
  'Has used open-source AI models (LLaMA, Mistral, etc.)',
  'Has vibe-coded a product or side project with AI',
  'Subscribes to 3+ AI newsletters or podcasts',
  'Spends too much money on AI subscriptions',
  'Reels feed is filled with AI memes',
  'Has used AI to write code they didn\'t fully understand',
  'Has replaced a tool with AI (e.g. Figma → AI design)',
  'Has an AI side project they haven\'t launched yet',
  'Works in AI/ML professionally',
  'Has seriously prompt engineered something',
  'Uses 3+ different AI tools daily',
  'Has tried to explain AI to a family member',
]

// Win lines: arrays of grid positions (0-15)
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
