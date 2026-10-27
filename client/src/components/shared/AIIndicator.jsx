import { Sparkles, Brain, Zap } from 'lucide-react';

export default function AIIndicator({ active = false, label = 'AI Processing' }) {
  if (!active) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 ai-highlight px-4 py-3 rounded-lg shadow-2xl animate-slide-in-right backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Animated icon group */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <Sparkles className="w-3 h-3 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
          <Zap className="w-3 h-3 text-blue-400 absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Label and animated dots */}
        <div>
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            {label}
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Analyzing transaction patterns</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" style={{ width: '100%' }} />
      </div>
    </div>
  );
}
