<div align="center">

# ⚔️ Interview Arena

**AI-powered code interview trainer. Paste code → get reviewed → get grilled → get better.**

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-teal?style=flat-square)](https://tailwindcss.com)

</div>

---

## 🎯 What It Does

Three modes to sharpen your interview skills:

### 🔬 Code Session (main feature)
1. **Paste any code** — Python, JS, Java, Go, whatever
2. **AI reviews it** — health score (0-100), issues ranked by severity, refactored version
3. **5-round interview** — AI asks questions *about your specific code* (not generic theory)
4. **Full report** — grade + score breakdown + code fixes + personalised study roadmap

### 🎓 Topic Practice
Choose a domain (DSA, React, System Design, SQL…) and question type:
- **Coding** — LeetCode-style problem with live editor, timer, and hint system
- **MCQ** — 5 multiple choice questions with instant feedback
- **Descriptive** — 3 open-ended interview questions evaluated by AI

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (custom terminal theme) |
| Routing | React Router 6 |
| State | Context API + useReducer |
| Auth | Firebase Authentication |
| Database | Firestore |
| AI | OpenRouter (gpt-4o-mini) or direct OpenAI |
| Voice | Web Speech API (native browser) |

---

## 🚀 Setup

### 1. Extract & install

```bash
cd interview-arena
npm install
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project**
2. **Authentication** → Sign-in method → Enable **Email/Password**
3. **Firestore Database** → Create database → **Start in test mode**
4. **Project Settings** → Your apps → **Add web app** → copy config

### 3. Create Firestore composite index

Go to **Firestore → Indexes → Create index**:

| Field | |
|---|---|
| Collection ID | `sessions` |
| Field 1 | `uid` — Ascending |
| Field 2 | `createdAt` — Descending |
| Query scope | Collection |

> ⚠️ Without this index, the dashboard shows an empty session list.

### 4. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Optional — or add key inside the app under Settings
VITE_OPENROUTER_API_KEY=sk-or-...
# VITE_OPENAI_API_KEY=sk-...
```

> 💡 **No API key in `.env`?** Just leave it blank and add your OpenRouter/OpenAI key inside the app: go to **Settings** after signing up.

### 5. Run

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔑 API Key Setup

The app needs an AI key to function. Two ways to set it:

**Option A — Environment variable** (recommended for deployment)
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx   # cheaper, more models
# or
VITE_OPENAI_API_KEY=sk-xxx
```

**Option B — In-app settings** (no `.env` needed)
1. Sign up → go to **Settings**
2. Paste your key in the **API Key** section
3. Key is stored in browser localStorage only — never sent to our servers

Get keys:
- OpenRouter: [openrouter.ai/keys](https://openrouter.ai/keys) — ~$0.15/1M tokens
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## 📦 Build & Deploy

### Build for production

```bash
npm run build
# output in dist/
```

### Deploy to Vercel (recommended)

1. Push code to GitHub (`.env` is gitignored — never committed)
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in **Project Settings → Environment Variables**
4. Deploy ✅

### Deploy to Netlify

```bash
npm run build
# drag dist/ folder to netlify.com/drop
```

Or connect GitHub repo and set build command to `npm run build`, output dir to `dist`.

---

## 🗄 Firestore Data Structure

```
users/{uid}
  displayName, email, createdAt, totalSessions, averageScore

sessions/{sessionId}
  uid, createdAt, status, difficulty, language, codeSnippet
  codeReview: { healthScore, strengths, issues, refactoredCode, topicsToStudy }
  questions: [{ question, concept }]
  rounds: [{ question, concept, userAnswer, aiFeedback, idealAnswer, score }]
  finalReport: { overallScore, interviewScore, codeScore, verdict, breakdown,
                  weakConcepts, studyRoadmap, codeFixSuggestions }
```

---

## 🗑 How to Delete Data

### Delete your sessions (in-app)
Go to **Settings → Data → Delete all session data**

### Delete all Firestore data (Firebase Console)
1. Firebase Console → **Firestore Database**
2. Click the three-dot menu on a collection → **Delete collection**

### Delete all Firestore data (CLI)
```bash
npx firebase-tools login
npx firebase-tools firestore:delete --all-collections --project YOUR_PROJECT_ID
```

### Delete a user account
Firebase Console → **Authentication → Users** → find user → **Delete**

---

## 📁 Project Structure

```
src/
├── App.jsx
├── context/
│   ├── AuthContext.jsx         Firebase auth state
│   └── SessionContext.jsx      Session state machine (idle→reviewing→interviewing→report)
├── hooks/
│   ├── useAuth.js              login / signup / logout
│   ├── useAI.js                OpenRouter/OpenAI call wrapper
│   └── useSession.js           Firestore CRUD for sessions
├── services/
│   ├── firebase.js             Firebase init
│   ├── firestore.js            CRUD helpers + deleteUserSessions
│   └── openrouter.js           Key priority chain + callAI()
├── utils/
│   ├── promptBuilder.js        All AI prompts (token-optimised)
│   └── scoreCalculator.js      Score formulas + grade/color helpers
├── components/
│   ├── layout/                 Navbar, ProtectedRoute
│   ├── ui/                     Loader, ScoreRing, TypingIndicator, VoiceInput
│   ├── review/                 CodeReviewCard
│   ├── interview/              QuestionCard, RoundCounter
│   ├── report/                 ScoreBreakdown, StudyRoadmap, CodeFixes, QuestionReplay
│   └── topic/                  CodingChallenge, McqChallenge, DescriptiveChallenge
└── pages/
    ├── Landing.jsx
    ├── Login.jsx / Signup.jsx
    ├── Dashboard.jsx
    ├── NewSession.jsx
    ├── Session.jsx             3-phase interview flow
    ├── Report.jsx
    ├── SessionHistory.jsx
    ├── Settings.jsx            Profile + API key + delete data
    └── TopicSession.jsx        Domain practice (coding/MCQ/descriptive)
```

---

## 💰 Token Usage (per session)

| Phase | Max tokens |
|---|---|
| Code review | ~1,400 |
| Generate 5 questions | ~500 |
| Evaluate answer (×5) | ~350 each |
| Final report | ~1,200 |
| **Total per session** | **~4,350 tokens** |

At gpt-4o-mini pricing (~$0.15/1M input + $0.60/1M output), one full session costs roughly **$0.003** (less than half a cent).

---

## ⚛️ React Concepts Used (for evaluation)

| Concept | Location |
|---|---|
| `useState` | All interactive components |
| `useEffect` | Firebase auth listener, session init, timer |
| `useReducer` | SessionContext state machine |
| `useContext` | AuthContext, SessionContext |
| `useCallback` | useSession CRUD, useAI |
| `useMemo` | Dashboard stats, CodeReviewCard issue sort |
| `useRef` | Code textarea tab handler, rounds accumulator |
| `React.lazy` + `Suspense` | Report, Settings, History, TopicSession |
| Controlled components | All form inputs |
| Lifting state up | Session phase managed in context |
| React Router v6 | All routing + protected routes |
| Conditional rendering | Phase gates throughout Session.jsx |

---

## 🔒 Security Notes

- API keys stored in env vars (never committed — `.env` is gitignored)
- In-app key stored in `localStorage` only (never sent to our servers)
- Firestore rules: set to **test mode** for development. For production, add rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /sessions/{id} {
        allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      }
    }
  }
  ```

---

<div align="center">
Built for the real interview grind. 🔥
</div>
