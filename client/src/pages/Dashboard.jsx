import { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Users,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Network,
  Play,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/shared/StatCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import AIIndicator from '../components/shared/AIIndicator';
import FraudInvestigationDiagram from '../components/investigation/FraudInvestigationDiagram';
import { analysisAPI, alertsAPI, demoAPI } from '../services/api';
import { formatCurrency, formatNumber, getRiskBadgeVariant, formatDateTime } from '../utils/formatters';
import { useNotifications } from '../hooks/useNotifications';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [summaryData, alertsData] = await Promise.all([
        analysisAPI.getSummary(),
        alertsAPI.getAll()
      ]);
      setSummary(summaryData);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      showError(`Failed to load dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    try {
      setAnalyzing(true);
      const result = await analysisAPI.run();
      showSuccess(`Analysis complete! Generated ${result.alertsGenerated} alerts.`);
      await loadData();
    } catch (error) {
      showError(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  async function resetDemo() {
    if (!confirm('Reset to demo data? This will clear all current data and analysis.')) {
      return;
    }
    try {
      await demoAPI.reset();
      showSuccess('Demo data restored successfully');
      await loadData();
    } catch (error) {
      showError(`Failed to reset: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentAlerts = alerts.slice(0, 5);
  
  const alertsByRisk = [
    { name: 'Critical', value: summary?.alertsBreakdown?.critical || 0, color: '#ef4444' },
    { name: 'High', value: summary?.alertsBreakdown?.high || 0, color: '#f97316' },
    { name: 'Medium', value: summary?.alertsBreakdown?.medium || 0, color: '#f59e0b' },
    { name: 'Low', value: summary?.alertsBreakdown?.low || 0, color: '#10b981' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      {/* AI Processing Indicator */}
      <AIIndicator active={analyzing} label="AI Analysis in Progress" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Overview Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Transaction network intelligence and fraud detection</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetDemo}
            className="btn-secondary flex items-center gap-2 focus-highlight"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Demo
          </button>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="btn-ai flex items-center gap-2 ai-highlight shadow-xl"
          >
            {analyzing ? (
              <>
                <LoadingSpinner size="sm" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {!summary?.analyzed && (
        <div className="card p-6 bg-blue-500/5 border-blue-500/20 animate-slide-in-up stagger-1 ai-highlight">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Ready for AI Analysis</h3>
              <p className="text-slate-400 mb-3">
                Click "Run AI Analysis" to detect fraud patterns using advanced machine learning algorithms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Transactions"
          value={formatNumber(summary?.totalTransactions || 0)}
          icon={ArrowLeftRight}
          delay={0}
          className="focus-highlight"
        />
        <StatCard
          title="Unique Accounts"
          value={formatNumber(summary?.totalAccounts || 0)}
          icon={Users}
          delay={100}
          className="focus-highlight"
        />
        <StatCard
          title="AI Alerts Generated"
          value={formatNumber(summary?.alertsGenerated || 0)}
          icon={AlertTriangle}
          delay={200}
          className="ai-highlight focus-highlight"
        />
        <StatCard
          title="High Risk Alerts"
          value={formatNumber(summary?.highRiskAlerts || 0)}
          icon={TrendingUp}
          delay={300}
          className="ai-highlight focus-highlight"
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(alerts.reduce((sum, a) => sum + (a.details?.totalAmount || 0), 0))}
          icon={DollarSign}
          delay={400}
          className="focus-highlight"
        />
        <StatCard
          title="Connected Networks"
          value={formatNumber(summary?.totalAccounts ? Math.ceil(summary.totalAccounts / 10) : 0)}
          icon={Network}
          delay={500}
          className="focus-highlight"
        />
      </div>

      {/* Premium Fraud Investigation Diagram */}
      <div className="animate-slide-in-up stagger-2">
        <FraudInvestigationDiagram />
      </div>

      {/* Charts */}
      {summary?.analyzed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in-up stagger-2">
          {/* Alerts by Risk Level */}
          <div className="card p-6 focus-highlight hover:border-blue-500/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              AI-Detected Alerts by Risk Level
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertsByRisk}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {alertsByRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pattern Categories */}
          <div className="card p-6 focus-highlight hover:border-blue-500/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              AI Detection Pattern Categories
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Circular', count: alerts.filter(a => a.category === 'CIRCULAR_TRANSFER').length },
                  { name: 'Rapid', count: alerts.filter(a => a.category === 'RAPID_MOVEMENT').length },
                  { name: 'Chain', count: alerts.filter(a => a.category === 'SUSPICIOUS_CHAIN').length },
                  { name: 'Mule', count: alerts.filter(a => a.category === 'POTENTIAL_MULE').length },
                  { name: 'Burst', count: alerts.filter(a => a.category === 'TRANSACTION_BURST').length },
                  { name: 'High Value', count: alerts.filter(a => a.category === 'HIGH_VALUE').length }
                ]}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {summary?.analyzed && recentAlerts.length > 0 && (
        <div className="card focus-highlight hover:border-blue-500/30 transition-all duration-300">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Recent AI Fraud Alerts
            </h2>
          </div>
          <div className="overflow-x-auto smooth-scroll">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Alert ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Accounts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Detected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentAlerts.map((alert, idx) => (
                  <tr 
                    key={alert.id} 
                    className="hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                      {alert.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {alert.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <div className="flex gap-1 flex-wrap">
                        {alert.accounts.slice(0, 3).map((acc, i) => (
                          <span key={i} className="font-mono text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                            {acc}
                          </span>
                        ))}
                        {alert.accounts.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{alert.accounts.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRiskBadgeVariant(alert.riskBand)}>
                        {alert.riskBand} ({alert.riskScore})
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatDateTime(alert.detectedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="warning">{alert.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
