// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// ── in-memory backend ───────────────────────────────────────────────
const db = { sessions: {}, nextId: 1, plan: 'free', interest: [] }
const chatReplies = []

vi.mock('../../components/layout/Navbar', () => ({ default: () => null }))
vi.mock('../../context/AuthContext', () => {
  const ctx = { user: { uid: 'u1', email: 'dev@example.com' } } // stable, like the real context
  return { useAuthContext: () => ctx }
})
vi.mock('../../services/firestore', () => ({
  createArenaSession: vi.fn(async (uid, data) => {
    const id = `s${db.nextId++}`
    db.sessions[id] = { id, uid, status: 'live', transcript: [], code: '', createdAt: { toMillis: () => Date.now() }, ...data }
    return id
  }),
  updateArenaSession: vi.fn(async (id, patch) => { Object.assign(db.sessions[id], patch) }),
  getArenaSession: vi.fn(async (id) => (db.sessions[id] ? structuredClone({ ...db.sessions[id], createdAt: undefined }) : null)),
  getUserArenaSessions: vi.fn(async () => Object.values(db.sessions)),
  getUserPlan: vi.fn(async () => db.plan),
  recordUpgradeInterest: vi.fn(async (uid, email) => { db.interest.push({ uid, email }) }),
}))
vi.mock('../../services/openrouter', () => ({
  hasApiKey: () => true,
  callAIChat: vi.fn(async () => chatReplies.shift()),
  callAI: vi.fn(async () => ({
    criteria: [
      { id: 'correctness', score: 3, evidence: 'Parking flow ran end to end.', improve: 'Add tests.' },
      { id: 'modularity', score: 3, evidence: 'Separate Lot and Floor classes.' },
      { id: 'extensibility', score: 2, evidence: 'EV spots needed a rewrite.' },
      { id: 'communication', score: 4, evidence: 'Explained trade-offs clearly.' },
    ],
    summary: 'Solid machine coding round.',
    strengths: ['Clean classes'], redFlags: [], nextSteps: ['Strategy pattern', 'Tests', 'Concurrency'],
  })),
}))

import Arena from '../Arena'
import ArenaBrief from '../ArenaBrief'
import ArenaSession from '../ArenaSession'
import ArenaReport from '../ArenaReport'
import Pricing from '../Pricing'
import * as fs from '../../services/firestore'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/arena" element={<Arena />} />
        <Route path="/arena/session/:sessionId" element={<ArenaSession />} />
        <Route path="/arena/report/:sessionId" element={<ArenaReport />} />
        <Route path="/arena/:companyId/:roundId" element={<ArenaBrief />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  db.sessions = {}; db.nextId = 1; db.plan = 'free'; db.interest = []
  chatReplies.length = 0
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)

describe('Arena UI', () => {
  it('lists companies and expands a track', async () => {
    renderAt('/arena')
    fireEvent.click(screen.getByText('Flipkart'))
    expect(await screen.findByText('Machine coding')).toBeTruthy()
    expect(screen.getByText('90 min')).toBeTruthy()
  })

  it('full round: brief → live interview → scorecard', async () => {
    chatReplies.push(
      { message: 'Hi! Build a parking lot with multiple floors.', stage: 'problem', done: false },
      { message: 'Thanks, that is all the time we have.', stage: 'wrapup', done: true },
    )
    renderAt('/arena/flipkart/machine_coding')
    expect(screen.getByText('Modularity')).toBeTruthy()
    fireEvent.click(await screen.findByText('START INTERVIEW →'))

    expect(await screen.findByText('Hi! Build a parking lot with multiple floors.')).toBeTruthy()
    const editor = screen.getByPlaceholderText('// write your solution here')
    fireEvent.change(editor, { target: { value: 'class Lot {}' } })
    fireEvent.change(screen.getByPlaceholderText(/Talk through your approach/), { target: { value: 'I would start with a Lot class.' } })
    fireEvent.click(screen.getByText('SEND →'))

    expect(await screen.findByText('Thanks, that is all the time we have.')).toBeTruthy()
    const s = db.sessions.s1
    expect(s.status).toBe('ended')
    expect(s.transcript).toHaveLength(3)
    expect(s.transcript[1].code).toBe('class Lot {}')

    cleanup()
    renderAt('/arena/report/s1')
    expect(await screen.findByText('Hire')).toBeTruthy()           // 3,3,2,4 → 3.0 weighted
    expect(screen.getByText('Solid machine coding round.')).toBeTruthy()
    expect(db.sessions.s1.status).toBe('scored')
    expect(db.sessions.s1.scorecard.verdict.key).toBe('hire')
  })

  it('blocks a 4th free round this month and links to pricing', async () => {
    for (let i = 0; i < 3; i++) await fs.createArenaSession('u1', { companyId: 'google', roundId: 'phone' })
    renderAt('/arena/google/phone')
    expect(await screen.findByText(/3 free rounds used this month/)).toBeTruthy()
    expect(screen.queryByText('START INTERVIEW →')).toBeNull()
  })

  it('pro plan is never blocked', async () => {
    db.plan = 'pro'
    for (let i = 0; i < 5; i++) await fs.createArenaSession('u1', { companyId: 'google', roundId: 'phone' })
    renderAt('/arena/google/phone')
    await waitFor(() => expect(fs.getUserPlan).toHaveBeenCalled())
    expect(await screen.findByText('START INTERVIEW →')).toBeTruthy()
  })

  it('pricing captures upgrade interest', async () => {
    renderAt('/pricing')
    fireEvent.click(screen.getByText('GET PRO (EARLY ACCESS) →'))
    expect(await screen.findByText(/on the list/)).toBeTruthy()
    expect(db.interest).toEqual([{ uid: 'u1', email: 'dev@example.com' }])
  })
})
