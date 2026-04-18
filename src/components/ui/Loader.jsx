export default function Loader({ message='loading...' }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-10 h-10 border-2 border-g-border border-t-lime animate-spin" style={{animationDuration:'0.8s'}} />
      <span className="text-white/40 font-mono text-xs">{message}</span>
    </div>
  )
}
