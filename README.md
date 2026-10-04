<div align="center">

<br/>

```
 ██╗ ███╗   ██╗ ████████╗ ███████╗ ██████╗  ██╗   ██╗ ██╗ ███████╗ ██╗    ██╗
 ██║ ████╗  ██║    ██╔══╝ ██╔════╝ ██╔══██╗ ██║   ██║ ██║ ██╔════╝ ██║    ██║
 ██║ ██╔██╗ ██║    ██║    █████╗   ██████╔╝ ██║   ██║ ██║ █████╗   ██║ █╗ ██║
 ██║ ██║╚██╗██║    ██║    ██╔══╝   ██╔══██╗ ╚██╗ ██╔╝ ██║ ██╔══╝   ██║███╗██║
 ██║ ██║ ╚████║    ██║    ███████╗ ██║  ██║  ╚████╔╝  ██║ ███████╗ ╚███╔███╔╝
 ╚═╝ ╚═╝  ╚═══╝    ╚═╝    ╚══════╝ ╚═╝  ╚═╝   ╚═══╝   ╚═╝ ╚══════╝  ╚══╝╚══╝

             ██╗   ██╗ ██╗   ██████╗  ████████╗  ██████╗
             ╚██╗ ██╔╝ ██║  ██╔════╝     ██╔══╝ ██╔═══██╗
              ╚████╔╝  ██║  ██║  ███╗    ██║    ██║   ██║
               ╚██╔╝   ██║  ██║   ██║    ██║    ██║   ██║
                ██║    ██║  ╚██████╔╝    ██║    ╚██████╔╝ 
                ╚═╝    ╚═╝   ╚═════╝     ╚═╝     ╚═════╝
```

**AI-Powered Code Interview Trainer**

*Paste your code → Get reviewed → Get grilled → Get better*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini-412991?style=flat-square)](https://openrouter.ai)

</div>

---

## ✦ What is Interview Arena?

Interview Arena simulates a real technical interview — but on **your own code**, not generic problems.

Unlike LeetCode or mock interview platforms that give you pre-set questions, Interview Arena analyses whatever code *you* paste, then asks you questions specifically about *your* architecture, *your* decisions, and *your* weak spots.

```
┌─────────────────────────────────────────────────────────────────┐
│                        SESSION FLOW                             │
│                                                                 │
│  📋 Paste Code          →    AI reviews it (health score,       │
│  🔬 Code Review              issues by severity, refactor)      │
│                                                                 │
│  🎯 5-Round Interview   →    Questions about YOUR specific       │
│                              code — not generic theory          │
│                                                                 │
│  📊 Final Report        →    Grade + breakdown + code diff      │
│                              + personalised study roadmap       │
└─────────────────────────────────────────────────────────────────┘
```

Plus a full **Topic Practice** mode (DSA, React, System Design, SQL…) with Coding, MCQ, and Descriptive formats.

---

## ✦ Features

| Feature | Description |
|---------|-------------|
| 🔬 **AI Code Review** | Health score 0–100, issues ranked by severity, refactored version |
| 🎯 **5-Round Interview** | Questions generated from *your* code, live scoring per round |
| 📊 **Full Report** | Grade, score breakdown, unified code diff, study roadmap |
| 📁 **File / Project Upload** | Upload individual files or an entire folder — AI analyses the whole project |
| 🎓 **Topic Practice** | 12 domains, 3 question types (Coding/MCQ/Descriptive), custom topics with subtopics |
| 💻 **Coding Editor** | Split-panel LeetCode-style editor with tab support, timer, and hint system |
| 🎤 **Voice Input** | Speak your answers using the browser's native Speech Recognition |
| ★ **Bookmarks** | Save any question for later review at `/bookmarks` |
| 📅 **Activity Heatmap** | GitHub-style contribution calendar showing your practice streak |
| 📈 **Weekly Progress** | This-week vs last-week score delta, struggled concepts |
| 🔁 **Retry Same Code** | Re-run an interview on the same snippet with one click |
| 🔗 **Copy Link** | Copy the report URL (only you can open it while signed in) |
| 🌗 **Dark / Light Mode** | Persistent theme toggle with full light-mode stylesheet |
| 🔐 **Google + Email Auth** | Sign in with Google or email/password |

---

## ✦ Arena Pro: company interview rounds

Practise the actual round formats companies run, with a live AI interviewer that stays in character.

```
Pick a company  →  Read the brief + rubric  →  Live interview (text or voice)  →  Scorecard + hire verdict
```

| Feature | Description |
|---------|-------------|
| 🏢 **9 company tracks** | Google, Amazon, Microsoft, Atlassian, Flipkart, Razorpay, Swiggy, Uber, AI startup |
| 🧩 **6 round types** | DSA, machine coding, LLD, system design, behavioral, project deep-dive |
| 🎭 **Live interviewer** | Company persona, one question at a time, pushes on vague answers, mid-round twist, wraps up on a time/turn budget |
| 💻 **Split editor** | Code rounds send your latest editor snapshot with every reply |
| 🔊 **Voice** | Interviewer speaks (Web Speech synthesis), you answer by mic |
| 📋 **Rubric scorecard** | Each criterion scored 1-4 with evidence from the transcript and a concrete tip |
| ⚖️ **Hire verdict** | Strong Hire / Hire / Lean No / No Hire computed from rubric weights; a 1 on a heavy criterion caps the verdict |
| 📈 **Readiness** | Per-company readiness across the whole loop, weakest rubric areas |
| 💳 **Plans** | Free: 3 rounds/month. Pro: unlimited (₹299/month). Upgrade button records early-access interest until payments ship |

Round formats are modelled on publicly shared candidate experiences; real loops vary by team, level and year.

### Arena data model

```
arenaSessions/{id}   uid, companyId, roundId, level, status (live → ended → scored),
                     transcript[], code, startedAt, endedAt, scorecard{criteria, verdict, …}
users/{uid}.plan     'free' | 'pro'
upgradeInterest/{uid} who clicked "Get Pro" (demand signal before building checkout)
```

### Tests

```bash
npm test        # vitest: engine, scorecard, readiness, plans, data integrity + UI flow tests
```

> ⚠️ **Before charging money:** plan limits are currently enforced in the client. Move session creation
> behind a Cloud Function (or similar) and add Razorpay checkout + webhook that sets `users/{uid}.plan`.

---

## ✦ Tech Stack

```
Frontend     React 18 + Vite 5
Styling      Tailwind CSS 3 (custom terminal aesthetic — JetBrains Mono)
Routing      React Router 6
State        Context API + useReducer (AuthContext, SessionContext, BookmarkContext, ThemeContext)
Auth         Firebase Authentication (Email/Password + Google OAuth)
Database     Cloud Firestore
AI           OpenRouter (gpt-4o-mini) or direct OpenAI
Voice        Web Speech API (browser-native, no library)
```

---

## ✦ React Concepts Coverage

> *For academic evaluation — every concept is used in context, not just imported.*

| Concept | Location |
|---------|----------|
| `useState` | Every interactive component |
| `useEffect` | Auth listener, session init, streak data fetch, timer |
| `useReducer` | `SessionContext`, `BookmarkContext` — state machines |
| `useContext` | `AuthContext`, `SessionContext`, `BookmarkContext`, `ThemeContext` |
| `useCallback` | `useSession` CRUD, `useAI`, all async handlers in `Session.jsx` |
| `useMemo` | `StreakCalendar` grid, `WeeklyReport` aggregation, `CodeDiff` line diff, `Dashboard` stats |
| `useRef` | `roundsRef` (stale closure fix), `mountedRef` (unmount safety), file inputs, code editor |
| `useTransition` | `useAI.js` — marks `isAILoading=false` dispatch as non-urgent (React 18 concurrent) |
| `React.lazy` + `Suspense` | Report, Settings, History, TopicSession, Bookmarks |
| Controlled components | All form inputs |
| Lifting state up | Session phase managed in context, passed down to sub-phases |
| React Router v6 | All routing, protected routes, `navigate` with `state` (retry prefill) |
| Conditional rendering | Phase gates throughout Session, loading screens, feature guards |

---

## ✦ Quick Start

### 1 — Clone & Install

```bash
cd interview-arena
npm install
```

### 2 — Firebase Setup

1. [console.firebase.google.com](https://console.firebase.google.com) → **Create project**
2. **Authentication** → Sign-in method → Enable **Email/Password** + **Google**
   - For Google: set a support email and save
3. **Firestore Database** → Create database → **Test mode**
4. **Project Settings** → Your apps → **Add web app** → copy config

#### Firestore rules

Paste [`firestore.rules`](firestore.rules) into **Firestore → Rules** (or `firebase deploy --only firestore:rules`).
No composite indexes are needed: queries filter by `uid` and sort on the client.

### 3 — Environment Variables

```bash
cp .env.example .env
```

Fill in the Firebase values in `.env`, then choose how the AI is called (see `.env.example`):

| Mode | Where the key lives | Use for |
|------|--------------------|---------|
| **Server proxy** (`VITE_AI_PROXY=true`) | Server env `OPENROUTER_API_KEY`, never sent to browsers | Any deployed site |
| **Settings page** | Each user's own browser (`localStorage`) | Bring-your-own-key |
| `VITE_OPENROUTER_API_KEY` | ⚠ Bundled into public JS | Local dev only |

> ⚠️ Anything prefixed `VITE_` ends up in the built JavaScript. Never put an AI key in a `VITE_` variable on a deployed site.

### 4 — Run

```bash
npm run dev
# → http://localhost:5173
```

---

## ✦ API Keys

Two options, same models:

| Provider | Key prefix | Get it at | Cost |
|----------|-----------|-----------|------|
| **OpenRouter** (recommended) | `sk-or-v1-...` | [openrouter.ai/keys](https://openrouter.ai/keys) | ~$0.15 / 1M tokens |
| **OpenAI direct** | `sk-...` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | ~$0.15 / 1M tokens |

Key priority: proxy (`VITE_AI_PROXY=true`) → `VITE_OPENROUTER_API_KEY` → `VITE_OPENAI_API_KEY` → Settings (localStorage)

**Cost per full session** (code review + 5 rounds + report): **~$0.003** (less than half a cent)

---

## ✦ Deploy

### Vercel (recommended)

```bash
# Push to GitHub, then:
# 1. vercel.com → Import repository
# 2. Project Settings → Environment Variables:
#      VITE_FIREBASE_* (all six), VITE_AI_PROXY=true,
#      OPENROUTER_API_KEY, FIREBASE_PROJECT_ID   (server-only, no VITE_ prefix)
# 3. Deploy. api/ai.js becomes POST /api/ai: it verifies the Firebase ID token,
#    validates the request, locks the model, caps tokens and rate-limits per user.
npm run build   # test locally first
```

### Netlify

```bash
npm run build
# Drag dist/ to netlify.com/drop
# Or: connect repo, set build command = npm run build, publish dir = dist
# Note: the /api/ai proxy is written for Vercel. On Netlify, use bring-your-own-key
# (Settings page) or port api/_aiProxy.js to a Netlify function.
```

---

## ✦ Project Structure

```
src/
├── App.jsx                         Routes + all context providers
├── context/
│   ├── AuthContext.jsx             Firebase auth state
│   ├── SessionContext.jsx          Session state machine (idle→reviewing→interviewing→report)
│   ├── BookmarkContext.jsx         Bookmark CRUD with useReducer
│   └── ThemeContext.jsx            Dark/light mode with localStorage persistence
├── hooks/
│   ├── useAuth.js                  login / signup / googleSignIn / logout
│   ├── useAI.js                    OpenRouter/OpenAI call wrapper + useTransition
│   └── useSession.js               Firestore CRUD for sessions
├── services/
│   ├── firebase.js                 Firebase app init
│   ├── firestore.js                All Firestore helpers
│   └── openrouter.js               Key priority chain + callAI()
├── utils/
│   ├── promptBuilder.js            All AI prompts (token-optimised per call)
│   └── scoreCalculator.js          Score formulas, grade, color helpers
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx              Sticky nav with active states + theme toggle
│   │   └── ProtectedRoute.jsx      Auth guard
│   ├── ui/
│   │   ├── Loader.jsx              Spinning border loader
│   │   ├── ScoreRing.jsx           Animated SVG score ring
│   │   ├── TypingIndicator.jsx     3-dot blink animation
│   │   ├── VoiceInput.jsx          Web Speech API mic button
│   │   ├── BookmarkIcon.jsx        ★/☆ toggle with loading state
│   │   └── GoogleButton.jsx        Google OAuth button with inline SVG icon
│   ├── dashboard/
│   │   ├── StreakCalendar.jsx       52-week activity heatmap (GitHub-style)
│   │   └── WeeklyReport.jsx        This-week stats with delta vs last week
│   ├── review/
│   │   └── CodeReviewCard.jsx      Code review phases: strengths, issues, refactor
│   ├── interview/
│   │   ├── QuestionCard.jsx        Question display with round + concept badges
│   │   └── RoundCounter.jsx        Round progress boxes with scores
│   ├── report/
│   │   ├── ScoreBreakdown.jsx      4-metric bar chart breakdown
│   │   ├── QuestionReplay.jsx      Expandable Q&A replay with bookmark icons
│   │   ├── CodeDiff.jsx            Unified line diff with +/− highlighting
│   │   └── StudyRoadmap.jsx        Expandable study plan with resources
│   └── topic/
│       ├── CodingChallenge.jsx     Split-panel editor, timer, hint system
│       ├── McqChallenge.jsx        5-question MCQ with instant feedback
│       └── DescriptiveChallenge.jsx Open-ended Q&A with voice input
└── pages/
    ├── Landing.jsx                 Public landing page
    ├── Login.jsx                   Email + Google sign-in
    ├── Signup.jsx                  Email + Google sign-up
    ├── Dashboard.jsx               Stats, heatmap, weekly report, recent sessions
    ├── NewSession.jsx              Code paste + file/folder upload + config
    ├── Session.jsx                 3-phase interview flow (review → interview → report trigger)
    ├── Report.jsx                  Full report: scores, diff, roadmap, share/retry actions
    ├── SessionHistory.jsx          All past sessions with grades
    ├── Bookmarks.jsx               Saved questions library
    ├── Settings.jsx                Profile, API key management, data deletion
    └── TopicSession.jsx            Domain → type → difficulty → challenge wizard
```

---

## ✦ Token Budget

| Call | Max tokens | When called |
|------|-----------|-------------|
| Code review (≤4k chars of code) | 2,200 | Once per session start |
| Generate 5 questions | 500 | Once after review |
| Evaluate answer | 350 | Per round (×5) |
| Final report | 1,200 | Once at end |
| Arena interviewer turn | 320 | Per reply (6-14 per round) |
| Arena scorecard | 900 | Once per round |
| Topic MCQ (5 Qs) | 600 | Topic practice |
| Topic coding problem | 700 | Topic practice |
| Topic descriptive eval | 200 | Per question (×3) |
| Hint | 100 | On demand (coding mode) |

**Full code session: ~5-6k output tokens, well under $0.01 on gpt-4o-mini.**

---

## ✦ Data & Privacy

- **API keys**: in proxy mode the key never leaves the server. In bring-your-own-key mode it stays in the user's browser `localStorage` and is only sent to OpenRouter/OpenAI
- **Code snippets** sent to OpenRouter/OpenAI for AI processing — subject to their privacy policies
- **Session data** (code, Q&A, scores) stored in your Firebase project — you own it
- **Delete your data**: Settings → Data → "Delete all session data" (code sessions + arena rounds)

---

## ✦ Firestore Security Rules (Production)

The rules live in [`firestore.rules`](firestore.rules). They enforce:

- every document is readable/writable only by the user whose `uid` it carries
- owners can't re-assign a document to another user on update
- users can't create or change their own `plan` (set it from the console or a payment webhook)
- `upgradeInterest` is write-only for users

---

## ✦ How to Delete Data

**In-app (your sessions only):**
Settings → Data → "Delete all session data"

**Firebase Console (everything):**
Firestore Database → select collection → three-dot menu → Delete collection

**Firebase CLI (full wipe):**
```bash
npx firebase-tools login
npx firebase-tools firestore:delete --all-collections --project YOUR_PROJECT_ID
```

**Delete a user account:**
Firebase Console → Authentication → Users → find user → Delete

---

<div align="center">

Built for the grind. ⚔️

*This project is an academic submission. All AI processing is done via OpenRouter/OpenAI APIs.*

</div>
