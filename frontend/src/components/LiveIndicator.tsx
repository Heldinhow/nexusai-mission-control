interface LiveIndicatorProps {
  connected: boolean
}

export function LiveIndicator({ connected }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
      <span className="text-xs text-slate-400">
        {connected ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  )
}
