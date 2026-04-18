export default function QuestionCard({ question, roundNumber }) {
  return (
    <div className="border border-g-border bg-g-900 p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lime font-mono text-xs border border-lime/30 px-2 py-0.5">
          round {roundNumber}
        </span>
        <span className="text-white/30 font-mono text-xs border border-g-border px-2 py-0.5">
          {question.concept}
        </span>
      </div>
      <p className="text-white font-mono text-sm leading-relaxed">{question.question}</p>
    </div>
  )
}
