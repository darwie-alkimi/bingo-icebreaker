# PRD: AI Maxxing Bingo

**Live URL:** https://sublime-elegance-production-c35a.up.railway.app  
**Repo:** https://github.com/darwie-alkimi/bingo-icebreaker  
**Last updated:** 2026-04-21

---

## Overview

A real-time multiplayer bingo icebreaker for live AI meetup events. Attendees mingle in person, find people who match each square's description, and stamp their card. First to complete a line wins. Runs on personal devices (phones/laptops) with no login or app install required.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Real-time | Socket.io (persistent WebSocket server) |
| State | In-memory (server JS Maps/Arrays — no database) |
| Styling | Tailwind CSS |
| Fonts | DM Sans (body), Instrument Serif (headings) |
| Deployment | Railway (required for persistent Socket.io server) |

---

## Game Rules

- Single shared session — one URL, no join code, everyone plays together
- Each player gets a randomly shuffled **3x3 grid** (9 squares, different order per player)
- **Win condition:** complete any row, column, or diagonal
- **Stamping a square:** tap a square → enter the name of the person who matches → stamp it
- The name is free text — does not need to be a live player in the session
- Same name can be used on multiple squares (no restriction)
- **Inactivity timeout:** players with no activity for 60 minutes are automatically removed

---

## Bingo Squares (9 total)

| # | Prompt |
|---|--------|
| 1 | Lived in a different country outside of England |
| 2 | Reels feed is filled with AI memes |
| 3 | Spends too much money on AI subscriptions |
| 4 | Taught their parents how to use AI |
| 5 | Works in a startup |
| 6 | Ran a marathon |
| 7 | Set up their own OpenClaw agent |
| 8 | Rewatched the same show 3+ times |
| 9 | Loves pineapple on pizza |

---

## User Flow

### Join Page (`/`)
- Player enters their name and clicks "Join Game"
- Server creates a player record and a randomly shuffled card
- Player ID, name, and card are stored in `sessionStorage`
- Player is redirected to `/game`

### Game Screen (`/game`)

```
┌──────────────────────────┬──────────────────┐
│                          │ 🟢 Live Players  │
│   AI Maxxing Bingo       │ ──────────────── │
│   Playing as: Darwie     │  Darwie    (you) │
│                          │  Alex            │
│   Stamped  3  / 9        │  Sam             │
│                          │ ──────────────── │
│  ┌──────┬──────┬──────┐  │  Leaderboard     │
│  │      │  ✓   │      │  │  🥇 Alex         │
│  │      │ Sam  │      │  │  🥈 Sam          │
│  ├──────┼──────┼──────┤  │  🥉 Jordan       │
│  │  ✓   │      │      │  └──────────────────┘
│  │ Alex │      │      │
│  ├──────┼──────┼──────┤
│  │      │      │  ✓   │
│  │      │      │ Jo   │
│  └──────┴──────┴──────┘
│
│  Tap a square · enter who matches · get a line to win
└──────────────────────────┘
```

- Tap an unmarked square → modal opens → enter person's name → stamp it
- Stamped squares turn black with a ✓ and the name
- Completing a line highlights those squares with a ring and triggers full-screen confetti
- Score bar shows "Stamped X / 9" — pulses "BINGO!" when a line is complete

---

## Real-time Features

| Event | Trigger | Effect |
|-------|---------|--------|
| `player_joined` | New player joins | Added to live player list for all |
| `player_left` | Player closes tab | Removed from live player list for all |
| `mark_update` | Player stamps a square | Syncs across that player's other tabs |
| `new_winner` | Player completes a BINGO line | Podium updates for all players |

---

## Leaderboard / Podium

- Appears as soon as the first player gets BINGO
- Shows 🥇 1st, 🥈 2nd, 🥉 3rd
- Only the player's **first** completed line counts for podium rank
- Persists for the whole session even if the winner disconnects
- Players beyond 3rd are recorded but not shown on the podium

---

## In-Memory Data Model

```
state.players   Map<playerId, { id, name }>
state.cards     Map<playerId, { squareOrder: number[], marks: Map<position, name>, inactivityTimer }>
state.winners   Array<{ playerId, playerName, lineType, podiumRank, achievedAt }>
```

- All state lives in server memory — wiped on server restart
- Cards are preserved through disconnects so players can rejoin and continue
- Players removed from live list on disconnect but card kept for rejoin

---

## Design

- Background: `#fafafa` (off-white)
- Unstamped squares: white with `#e5e5e5` border
- Stamped squares: `#1a1a1a` (near-black) with white text
- Winning line squares: stamped + `ring-2` highlight
- Pill-shaped score bar below title
- Celebration: monochrome confetti (black/grey tones)
- All labels in uppercase tracking with DM Sans
- Title in Instrument Serif

---

## Inactivity Timeout

- Timer starts when a player joins (60 minutes)
- Resets every time the player stamps a square
- On expiry: player removed from live list, card wiped, `player_left` broadcast to all

---

## Session Persistence

- `sessionStorage` stores `bingo_player_id`, `bingo_player_name`, `bingo_square_order`
- On page refresh: `rejoin` event rehydrates marks from server memory
- If server has restarted (session gone): player is redirected to join page

---

## Deployment

- Platform: **Railway** (not Vercel — Socket.io requires a persistent server)
- Start command: `NODE_ENV=production node server.js`
- Build command: `next build`
- No environment variables required
- State resets on each redeploy (intentional for event reset)
