import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Network,
  AlertTriangle,
  FolderOpen,
  Settings,
  Shield,
  X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/network', icon: Network, label: 'Network Graph' },
  { to: '/alerts', icon: AlertTriangle, label: 'Fraud Alerts' },
  { to: '/cases', icon: FolderOpen, label: 'Cases' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col h-full relative">
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/50 relative group">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              FraudLens
            </h1>
            <p className="text-xs text-slate-400">AI-Powered Detection</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto smooth-scroll">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700/50'
              }`
            }
            style={{ 
              opacity: 0,
              animation: 'slide-in-right 0.3s ease-out forwards',
              animationDelay: `${idx * 0.05}s`
            }}
          >
            {({ isActive }) => (
              <>
                {/* Icon with smooth hover effect */}
                <item.icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'text-blue-400 scale-110' : 'group-hover:text-blue-400 group-hover:scale-110'
                }`} />
                
                {/* Label */}
                <span className="font-medium flex-1">{item.label}</span>

                {/* Active indicator with pulse */}
                {isActive && (
                  <div className="relative">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <div className="absolute inset-0 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <div className="text-xs text-slate-400 space-y-1">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            System Online
          </p>
          <p className="text-slate-500">© 2024 FraudLens AI</p>
          <p className="text-slate-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
