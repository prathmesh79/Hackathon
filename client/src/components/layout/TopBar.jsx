import { Menu, Bell, Search, Zap } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useState } from 'react';

export default function TopBar({ onMenuClick }) {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-6 py-4 relative z-20">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>

          <div className={`hidden md:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border transition-all duration-200 w-80 ${
            searchFocused ? 'border-blue-500/30 bg-slate-800/70' : 'border-slate-700/50'
          }`}>
            <Search className={`w-4 h-4 transition-colors duration-200 ${
              searchFocused ? 'text-blue-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              placeholder="Search transactions, accounts, alerts..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-400 w-full"
            />
            <kbd className="px-2 py-0.5 text-xs text-slate-400 bg-slate-700/50 rounded border border-slate-600">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-emerald-400 font-medium">System Online</span>
          </div>

          {/* AI Assistant badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg ai-highlight cursor-pointer interactive shadow-md">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">AI Assistant</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User avatar */}
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors duration-200">
            <span className="text-xs font-semibold text-white">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
