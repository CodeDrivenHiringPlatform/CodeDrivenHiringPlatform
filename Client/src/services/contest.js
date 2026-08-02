import api from '@/utils/api'
import { toast } from 'sonner'
import contestQuestions from '@/data/contestQuestions.js'

// ── Planned backend contract ────────────────────────────────────────────────
// GET  /contest/:id            -> { id, title, week, duration, totalQuestions,
//                                    sections, marking, registered, status,
//                                    instructions: [] }
// GET  /contest/:id/questions  -> { setId, contestId, questions: [ {id, category,
//                                    question, options, correct} ] }  (20 docs)
// POST /contest/:id/submit     -> { score, correct, wrong, unattempted }
//
// Until these are live on the Spring Boot side, each function below falls back
// to mock data so the UI can be built/tested independently. Swap out the mock
// fallback once the teammate's contest endpoints are ready.

export async function getContestDetails(contestId) {
  try {
    const response = await api.get(`/contest/${contestId}`)
    return response.data
  } catch (error) {
    console.warn('[contest] falling back to mock contest details:', error.message)
    return getMockContestDetails(contestId)
  }
}

export async function getContestQuestions(contestId) {
  try {
    const response = await api.get(`/contest/${contestId}/questions`)
    return response.data
  } catch (error) {
    console.warn('[contest] falling back to mock question set:', error.message)
    return getMockQuestionSet(contestId)
  }
}

export async function submitContest(contestId, answers, timeTakenSeconds) {
  try {
    const response = await api.post(`/contest/${contestId}/submit`, {
      answers,
      timeTakenSeconds,
    })
    return response.data
  } catch (error) {
    toast.error("Couldn't submit to server — showing local results")
    return null
  }
}

// GET /contests -> { live: [], upcoming: [], past: [] }
export async function getContestsList() {
  try {
    const response = await api.get('/contests')
    return response.data
  } catch (error) {
    console.warn('[contest] falling back to mock contests list:', error.message)
    return getMockContestsList()
  }
}

// GET /contest/:id/leaderboard -> [{ rank, name, score, avatar }]
export async function getLeaderboard(contestId) {
  try {
    const response = await api.get(`/contest/${contestId}/leaderboard`)
    return response.data
  } catch (error) {
    console.warn('[contest] falling back to mock leaderboard:', error.message)
    return getMockLeaderboard()
  }
}

// GET /contest/stats/me -> { attempted, bestRank, avgScore }
export async function getUserContestStats() {
  try {
    const response = await api.get('/contest/stats/me')
    return response.data
  } catch (error) {
    console.warn('[contest] falling back to mock user stats:', error.message)
    return getMockUserStats()
  }
}

// ── Mock data (used until backend is ready) ────────────────────────────────

function getMockContestDetails(contestId) {
  return {
    id: contestId,
    title: `CodeHire Weekly MCQ Contest #${contestId}`,
    week: Number(contestId) || 1,
    duration: '30 min',
    totalQuestions: 20,
    sections: 4,
    marking: '+2 / -0.5',
    registered: 1204,
    status: 'live',
    instructions: [
      'The test consists of 20 multiple-choice questions across 4 pages (5 questions per page).',
      'Each correct answer earns +2 marks, each wrong answer deducts 0.5 marks.',
      'Unattempted questions receive 0 marks.',
      'You can navigate freely between pages and change answers before submitting.',
      'The test auto-submits when the timer reaches zero.',
      'Once submitted, answers cannot be changed.',
    ],
  }
}

function getMockQuestionSet(contestId) {
  // One "document" = 20 questions for this specific contest/test
  return {
    setId: `mock-set-${contestId}`,
    contestId,
    questions: contestQuestions.slice(0, 20),
  }
}

function getMockContestsList() {
  const now = Date.now()
  return {
    live: [
      {
        id: '24',
        week: 24,
        title: 'CodeHire Weekly MCQ Contest #24',
        duration: '30 min',
        totalQuestions: 20,
        registered: 1204,
        sections: 4,
        marking: '+2 / -0.5',
        endsAt: new Date(now + 45 * 60 * 1000).toISOString(),
      },
    ],
    upcoming: [
      {
        id: '25',
        week: 25,
        title: 'CodeHire Weekly MCQ #25',
        duration: '30 min',
        totalQuestions: 20,
        startsAt: new Date(now + 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '26',
        week: 26,
        title: 'CodeHire Weekly MCQ #26',
        duration: '30 min',
        totalQuestions: 20,
        startsAt: new Date(now + 13 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
    past: [
      { id: '23', week: 23, title: 'CodeHire Weekly MCQ #23', participants: 980 },
      { id: '22', week: 22, title: 'CodeHire Weekly MCQ #22', participants: 1102 },
    ],
  }
}

function getMockLeaderboard() {
  return [
    { rank: 1, name: 'Mudassir', score: '19/20', avatar: 'M' },
    { rank: 2, name: 'Alex', score: '18/20', avatar: 'A' },
    { rank: 3, name: 'Sarah', score: '17/20', avatar: 'S' },
    { rank: 4, name: 'Riya', score: '16/20', avatar: 'R' },
    { rank: 5, name: 'Liam', score: '16/20', avatar: 'L' },
  ]
}

function getMockUserStats() {
  return { attempted: 8, bestRank: 12, avgScore: 74 }
}