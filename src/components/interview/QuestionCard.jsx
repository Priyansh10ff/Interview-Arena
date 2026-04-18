export default function QuestionCard({ question, roundNumber }) {
  return (
    <div className="bg-arena-700 border border-arena-border rounded-xl p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono rounded-full">
          Round {roundNumber}
        </span>
        <span className="px-2.5 py-0.5 bg-arena-600 border border-arena-border text-white/40 text-xs font-mono rounded-full">
          {question.concept}
        </span>
      </div>
      <p className="text-white text-base leading-relaxed font-medium">{question.question}</p>
    </div>
  )
}
