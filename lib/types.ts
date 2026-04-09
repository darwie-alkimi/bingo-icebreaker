export interface Player {
  id: string
  name: string
  created_at?: string
}

export interface Mark {
  id: string
  card_id: string
  square_index: number
  matched_name: string
  created_at: string
}

export interface Winner {
  playerId: string
  playerName: string
  lineType: string
  podiumRank: number | null
  achievedAt: string
}
