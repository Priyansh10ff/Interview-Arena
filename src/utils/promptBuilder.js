const trunc = (s,n) => s&&s.length>n ? s.slice(0,n)+'…' : (s||'')

// How much code each prompt sees. gpt-4o-mini is cheap, and 900 chars (~25 lines)
// was too little for a meaningful review.
export const CODE_LIMITS = { review: 4000, project: 7000, context: 1500 }

// ── Code Review (main session) ───────────────────────────────────────
export function buildCodeReviewPrompt(code, lang, diff) {
  return {
    system:`Senior ${diff}-level code reviewer. JSON only.`,
    user:`Review this ${lang} code:\n${trunc(code,CODE_LIMITS.review)}\nReturn:{"healthScore":<0-100>,"strengths":["..."],"issues":[{"line":"...","severity":"high|medium|low","description":"..."}],"refactoredCode":"...","topicsToStudy":["..."]}`,
    maxTokens:2200, // room for refactoredCode of a 4k-char snippet without truncating the JSON
  }
}
export function buildQuestionsPrompt(code, summary, diff) {
  return {
    system:`Technical interviewer. ${diff}. JSON only.`,
    user:`Code:${trunc(code,CODE_LIMITS.context)}\nReview:${trunc(summary,300)}\nReturn 5 questions:{"questions":[{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."}]}`,
    maxTokens:500,
  }
}
export function buildEvaluationPrompt(q, concept, ans, diff) {
  return {
    system:`Interviewer. ${diff}. JSON only.`,
    user:`Q:${q}\nConcept:${concept}\nAnswer:${trunc(ans,600)}\nReturn:{"score":<1-10>,"feedback":"<2 sentences>","idealAnswer":"<2 sentences>"}`,
    maxTokens:350,
  }
}
export function buildFinalReportPrompt(code, review, rounds, diff) {
  const rs = rounds.map((r,i)=>`R${i+1}[${r.concept}]${r.score}/10`).join(',')
  return {
    system:`Post-interview engineer. ${diff}. JSON only.`,
    user:`Code:${trunc(code,CODE_LIMITS.context)}\nHealth:${review.healthScore}/100,topics:${review.topicsToStudy?.join(',')}\nRounds:${rs}\nReturn:{"verdict":"<2 sentences>","breakdown":{"codeUnderstanding":<1-10>,"conceptClarity":<1-10>,"optimizationAwareness":<1-10>,"communication":<1-10>},"weakConcepts":["..."],"studyRoadmap":[{"concept":"...","why":"...","resource":"..."}],"codeFixSuggestions":[{"original":"...","fixed":"...","explanation":"..."}]}`,
    maxTokens:1200,
  }
}

// ── Topic session prompts ────────────────────────────────────────────
export function buildMcqPrompt(domain) {
  return {
    system:`Technical interviewer. Domain:${domain}. JSON only.`,
    user:`Generate 5 MCQ. Return:{"questions":[{"q":"...","options":["A)...","B)...","C)...","D)..."],"answerIndex":<0-3>,"explanation":"<1 sentence>"}]}`,
    maxTokens:600,
  }
}
export function buildDescriptivePrompt(domain, diff) {
  return {
    system:`Technical interviewer. Domain:${domain}, difficulty:${diff}. JSON only.`,
    user:`Generate 3 descriptive interview questions. Return:{"questions":[{"q":"...","keyPoints":"<what a good answer covers in 1 sentence>"},{"q":"...","keyPoints":"..."},{"q":"...","keyPoints":"..."}]}`,
    maxTokens:350,
  }
}
export function buildDescriptiveEvalPrompt(q, keyPoints, ans) {
  return {
    system:`Evaluating interview answer. JSON only.`,
    user:`Q:${q}\nKeyPoints:${keyPoints}\nAnswer:${trunc(ans,500)}\nReturn:{"score":<1-10>,"feedback":"<2 sentences>"}`,
    maxTokens:200,
  }
}
export function buildCodingProblemPrompt(domain, diff) {
  return {
    system:`Generate a ${diff} coding problem for ${domain}. JSON only.`,
    user:`Return:{"title":"...","difficulty":"Easy|Medium|Hard","description":"<problem statement>","examples":[{"input":"...","output":"...","explanation":"..."}],"constraints":["..."],"starterCode":{"javascript":"function solution(...) {\\n  // code here\\n}","python":"def solution(...):\\n    pass"}}`,
    maxTokens:700,
  }
}
export function buildHintPrompt(problem, code) {
  return {
    system:`Coding mentor. Give ONE directional hint only. No code, no full solution. JSON only.`,
    user:`Problem:${trunc(problem,200)}\nCurrent code:${trunc(code,200)}\nReturn:{"hint":"<1-2 sentences, directional only>"}`,
    maxTokens:100,
  }
}
export function buildCodingEvalPrompt(problem, code, lang) {
  return {
    system:`Senior engineer evaluating interview code. JSON only.`,
    user:`Problem:${trunc(problem,300)}\nSolution(${lang}):${trunc(code,500)}\nReturn:{"score":<0-100>,"timeComplexity":"...","spaceComplexity":"...","feedback":"<2 sentences>","improvement":"<1 sentence>"}`,
    maxTokens:300,
  }
}

// ── Multi-file / project analysis ───────────────────────────────────
export function buildProjectReviewPrompt(filesContent, diff) {
  return {
    system:`Senior ${diff}-level code reviewer analysing a multi-file project. JSON only.`,
    user:`Project files:\n${trunc(filesContent,CODE_LIMITS.project)}\nReturn:{"healthScore":<0-100>,"architecture":"<1 sentence summary>","strengths":["..."],"issues":[{"file":"...","severity":"high|medium|low","description":"..."}],"refactoredCode":"<fix for the most critical issue only>","topicsToStudy":["..."]}`,
    maxTokens:2200,
  }
}
export function buildProjectQuestionsPrompt(filesContent, reviewSummary, diff) {
  return {
    system:`Technical interviewer. ${diff}. JSON only.`,
    user:`Project excerpt:${trunc(filesContent,CODE_LIMITS.context)}\nReview:${trunc(reviewSummary,200)}\nReturn 5 questions about architecture/design decisions:{"questions":[{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."},{"question":"...","concept":"..."}]}`,
    maxTokens:500,
  }
}
