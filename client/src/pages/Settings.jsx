import { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { settingsAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      showError(`Failed to load settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      showSuccess('Settings saved successfully. Run analysis again to apply changes.');
    } catch (error) {
      showError(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fraud Detection Settings</h1>
        <p className="text-navy-300 mt-1">Configure detection rules and thresholds</p>
      </div>

      <div className="card p-6 bg-cyan-500/10 border-cyan-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-navy-300">
          Changes to these settings will take effect when you run the analysis engine again.
        </div>
      </div>

      {/* Detection Rules */}
      <div className="card p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Detection Rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Rapid Transfer Window (minutes)
            </label>
            <input
              type="number"
              value={settings.rapidTransferWindowMinutes}
              onChange={(e) =>
                setSettings({ ...settings, rapidTransferWindowMinutes: parseFloat(e.target.value) })
              }
              min="1"
              className="input"
            />
            <p className="text-xs text-navy-400 mt-1">
              Time window to detect rapid fund movement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Min Chain Length
            </label>
            <input
              type="number"
              value={settings.minChainLength}
              onChange={(e) => setSettings({ ...settings, minChainLength: parseFloat(e.target.value) })}
              min="2"
              className="input"
            />
            <p className="text-xs text-navy-400 mt-1">
              Minimum accounts in a suspicious chain
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Max Cycle Length
            </label>
            <input
              type="number"
              value={settings.maxCycleLength}
              onChange={(e) => setSettings({ ...settings, maxCycleLength: parseFloat(e.target.value) })}
              min="3"
              max="10"
              className="input"
            />
            <p className="text-xs text-navy-400 mt-1">
              Maximum cycle depth to detect
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Unusual Amount Threshold ($)
            </label>
            <input
              type="number"
              value={settings.unusualAmountThreshold}
              onChange={(e) =>
                setSettings({ ...settings, unusualAmountThreshold: parseFloat(e.target.value) })
              }
              min="0"
              className="input"
            />
            <p className="text-xs text-navy-400 mt-1">
              Flag transactions above this amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Burst Threshold (transactions)
            </label>
            <input
              type="number"
              value={settings.burstThreshold}
              onChange={(e) => setSettings({ ...settings, burstThreshold: parseFloat(e.target.value) })}
              min="1"
              className="input"
            />
            <p className="text-xs text-navy-400 mt-1">
              Transactions in 1 hour to trigger burst alert
            </p>
          </div>
        </div>
      </div>

      {/* Risk Scoring Weights */}
      <div className="card p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Risk Scoring Weights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Circular Transfer Weight
            </label>
            <input
              type="number"
              value={settings.circularTransferWeight}
              onChange={(e) =>
                setSettings({ ...settings, circularTransferWeight: parseFloat(e.target.value) })
              }
              min="0"
              max="100"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Rapid Movement Weight
            </label>
            <input
              type="number"
              value={settings.rapidMovementWeight}
              onChange={(e) => setSettings({ ...settings, rapidMovementWeight: parseFloat(e.target.value) })}
              min="0"
              max="100"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Suspicious Chain Weight
            </label>
            <input
              type="number"
              value={settings.suspiciousChainWeight}
              onChange={(e) =>
                setSettings({ ...settings, suspiciousChainWeight: parseFloat(e.target.value) })
              }
              min="0"
              max="100"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Mule Account Weight
            </label>
            <input
              type="number"
              value={settings.muleAccountWeight}
              onChange={(e) => setSettings({ ...settings, muleAccountWeight: parseFloat(e.target.value) })}
              min="0"
              max="100"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Unusual Activity Weight
            </label>
            <input
              type="number"
              value={settings.unusualActivityWeight}
              onChange={(e) =>
                setSettings({ ...settings, unusualActivityWeight: parseFloat(e.target.value) })
              }
              min="0"
              max="100"
              className="input"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-navy-700">
          <p className="text-sm text-navy-400">
            Risk scores are capped at 100. Higher weights increase the contribution of each pattern type.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">About FraudLens AI</h2>
        <div className="space-y-3 text-sm text-navy-300">
          <p>
            <strong className="text-white">FraudLens AI</strong> is a demonstration platform for suspicious transaction network detection using graph-based fraud analysis.
          </p>
          <p>
            <strong className="text-cyan-400">Detection Methods:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Circular Transfer Detection: Identifies funds moving in loops</li>
            <li>Rapid Fund Movement: Detects quick in-and-out transfers</li>
            <li>Suspicious Chains: Finds multi-hop transaction sequences</li>
            <li>Mule Account Patterns: Identifies potential intermediary accounts</li>
            <li>Unusual Activity: Flags transaction bursts and high-value transfers</li>
          </ul>
          <p className="pt-2">
            <strong className="text-amber-400">Important Limitations:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>This is a synthetic demonstration using generated data</li>
            <li>Alerts require human investigation and verification</li>
            <li>Risk scores are heuristic, not statistical probabilities</li>
            <li>Not connected to real financial systems</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
