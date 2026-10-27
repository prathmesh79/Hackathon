import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StatCard({ title, value, icon: Icon, trend, className = '', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  const formatDisplayValue = () => {
    if (typeof value === 'string' && value.includes('$')) {
      return `$${displayValue.toLocaleString()}`;
    }
    if (typeof displayValue === 'number') {
      return displayValue.toLocaleString();
    }
    return displayValue;
  };

  return (
    <div 
      className={`stat-card group ${className} ${
        isVisible ? 'animate-scale-in' : 'opacity-0'
      }`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white count-up mb-1">
            {formatDisplayValue()}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 animate-slide-in-right">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-md group-hover:bg-blue-500/20 transition-all duration-300" />
            <Icon className="w-6 h-6 text-blue-400 relative z-10" />
          </div>
        )}
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 -left-full group-hover:left-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-700 ease-out" />
    </div>
  );
}
