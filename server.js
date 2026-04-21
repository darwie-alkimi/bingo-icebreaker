const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// ─── In-memory game state ────────────────────────────────────────────────────

const state = {
  // playerId → { id, name }
  players: new Map(),
  // playerId → { squareOrder: number[], marks: Map<position, name> }
  cards: new Map(),
  // Array of { playerId, playerName, lineType, podiumRank, achievedAt }
  winners: [],
}

// ─── Bingo logic (duplicated from lib/bingo.ts for plain JS) ────────────────

const WIN_LINES = [
  { id: 'row_0', positions: [0, 1, 2] },
  { id: 'row_1', positions: [3, 4, 5] },
  { id: 'row_2', positions: [6, 7, 8] },
  { id: 'col_0', positions: [0, 3, 6] },
  { id: 'col_1', positions: [1, 4, 7] },
  { id: 'col_2', positions: [2, 5, 8] },
  { id: 'diag_main', positions: [0, 4, 8] },
  { id: 'diag_anti', positions: [2, 4, 6] },
]

function shuffleCard() {
  const indices = Array.from({ length: 9 }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function getCompletedLines(markedPositions) {
  const completed = new Set()
  for (const line of WIN_LINES) {
    if (line.positions.every(p => markedPositions.has(p))) {
      completed.add(line.id)
    }
  }
  return completed
}

// ─── Serialise state for new joiners ────────────────────────────────────────

function serializeState() {
  return {
    players: Array.from(state.players.values()),
    winners: state.winners,
  }
}

// ─── Server startup ──────────────────────────────────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res))

  const io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', socket => {
    // ── join ────────────────────────────────────────────────────────────────
    socket.on('join', ({ name }, cb) => {
      if (!name || !name.trim()) return cb({ error: 'Name required' })

      const playerId = Math.random().toString(36).slice(2)
      const squareOrder = shuffleCard()

      const TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes

      const inactivityTimer = setTimeout(() => {
        state.players.delete(playerId)
        state.cards.delete(playerId)
        io.emit('player_left', playerId)
      }, TIMEOUT_MS)

      state.players.set(playerId, { id: playerId, name: name.trim() })
      state.cards.set(playerId, { squareOrder, marks: new Map(), inactivityTimer })

      socket.data.playerId = playerId

      // Send this player their private card + full current state
      cb({
        playerId,
        squareOrder,
        state: serializeState(),
        marks: [], // fresh card, no marks yet
      })

      // Broadcast new player to everyone else
      socket.broadcast.emit('player_joined', { id: playerId, name: name.trim() })
    })

    // ── rejoin (page refresh) ────────────────────────────────────────────────
    socket.on('rejoin', ({ playerId }, cb) => {
      const card = state.cards.get(playerId)
      if (!card) return cb({ error: 'Session not found' })

      // Restore player to the live list (they may have disconnected)
      const existingPlayer = state.players.get(playerId)
      if (!existingPlayer) return cb({ error: 'Session not found' })

      state.players.set(playerId, existingPlayer)
      socket.data.playerId = playerId
      socket.broadcast.emit('player_joined', existingPlayer)

      cb({
        squareOrder: card.squareOrder,
        marks: Array.from(card.marks.entries()).map(([square_index, matched_name]) => ({ square_index, matched_name })),
        state: serializeState(),
      })
    })

    // ── mark ─────────────────────────────────────────────────────────────────
    socket.on('mark', ({ squareIndex, matchedName }, cb) => {
      const playerId = socket.data.playerId
      if (!playerId) return cb({ error: 'Not in a session' })

      const card = state.cards.get(playerId)
      const player = state.players.get(playerId)
      if (!card || !player) return cb({ error: 'Session not found' })

      if (card.marks.has(squareIndex)) return cb({ error: 'Square already marked' })

      card.marks.set(squareIndex, (matchedName || '').trim())

      // Reset inactivity timer on activity
      clearTimeout(card.inactivityTimer)
      card.inactivityTimer = setTimeout(() => {
        state.players.delete(playerId)
        state.cards.delete(playerId)
        io.emit('player_left', playerId)
      }, 60 * 60 * 1000)


      // Check for new BINGO lines
      const markedPositions = new Set(card.marks.keys())
      const nowCompleted = getCompletedLines(markedPositions)

      // Find lines the player hasn't claimed yet
      const existingLineIds = new Set(
        state.winners.filter(w => w.playerId === playerId).map(w => w.lineType)
      )
      const newLines = Array.from(nowCompleted).filter(l => !existingLineIds.has(l))

      const newWinners = []
      const playerAlreadyOnPodium = state.winners.some(w => w.playerId === playerId && w.podiumRank !== null)

      for (const lineType of newLines) {
        // Only award a podium rank for the player's first BINGO line
        let podiumRank = null
        if (!playerAlreadyOnPodium && newLines.indexOf(lineType) === 0) {
          const podiumCount = state.winners.filter(w => w.podiumRank !== null).length
          podiumRank = podiumCount < 3 ? podiumCount + 1 : null
        }
        const entry = {
          playerId,
          playerName: player.name,
          lineType,
          podiumRank,
          achievedAt: new Date().toISOString(),
        }
        state.winners.push(entry)
        newWinners.push(entry)
      }

      cb({ ok: true })

      // Broadcast the mark to this player's own listeners (other tabs)
      socket.broadcast.emit('mark_update', { playerId, squareIndex, matchedName: (matchedName || '').trim() })

      // Broadcast any new winners to everyone
      for (const winner of newWinners) {
        io.emit('new_winner', winner)
      }
    })

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const playerId = socket.data.playerId
      if (!playerId) return
      state.players.delete(playerId)
      // Keep the card in memory so they can rejoin and pick up where they left off
      io.emit('player_left', playerId)
    })
  })

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
