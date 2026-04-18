export default function TypingIndicator({ label = 'AI is thinking' }) {
  return (
    <div className="flex items-center gap-3 text-white/40 text-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            style={{ animation: `blink 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <span className="font-mono text-xs">{label}</span>
    </div>
  )
}
