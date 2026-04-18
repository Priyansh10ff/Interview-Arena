export default function TypingIndicator({ label='thinking...' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[0,1,2].map(i=>(
          <span key={i} className="w-1 h-1 bg-lime"
            style={{animation:`blink 1.2s ${i*0.2}s infinite`}}/>
        ))}
      </div>
      <span className="text-white/35 font-mono text-xs">{label}</span>
    </div>
  )
}
