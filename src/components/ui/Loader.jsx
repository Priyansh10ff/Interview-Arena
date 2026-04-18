export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1c1c2c" strokeWidth="3" />
          <circle
            cx="24" cy="24" r="20" fill="none"
            stroke="#f59e0b" strokeWidth="3"
            strokeDasharray="126"
            strokeDashoffset="31"
            strokeLinecap="round"
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .relative svg { animation: spin 1s linear infinite; }`}</style>
      </div>
      <p className="text-white/50 text-sm font-mono">{message}</p>
    </div>
  )
}
