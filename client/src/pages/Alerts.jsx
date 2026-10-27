import { useState, useEffect } from 'react';
import { Search, Download, Eye, Check, XCircle, Flag } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import Modal from '../components/shared/Modal';
import { alertsAPI, transactionsAPI } from '../services/api';
import { formatCurrency, formatDateTime, getRiskBadgeVariant, getStatusBadgeVariant } from '../utils/formatters';
import { useNotifications } from '../hooks/useNotifications';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    riskBand: '',
    category: '',
    status: ''
  });
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await alertsAPI.getAll();
      setAlerts(data.alerts || []);
    } catch (error) {
      showError(`Failed to load alerts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...alerts];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        alert =>
          alert.id.toLowerCase().includes(searchLower) ||
          alert.accounts.some(acc => acc.toLowerCase().includes(searchLower)) ||
          alert.evidence.toLowerCase().includes(searchLower)
      );
    }

    if (filters.riskBand) {
      filtered = filtered.filter(alert => alert.riskBand === filters.riskBand);
    }

    if (filters.category) {
      filtered = filtered.filter(alert => alert.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    setFilteredAlerts(filtered);
  }

  async function handleStatusChange(alertId, newStatus, reason) {
    try {
      await alertsAPI.updateStatus(alertId, { status: newStatus, reason });
      showSuccess(`Alert ${newStatus.toLowerCase().replace('_', ' ')}`);
      await loadAlerts();
      setSelectedAlert(null);
    } catch (error) {
      showError(`Failed to update alert: ${error.message}`);
    }
  }

  async function handleAddNote(alertId, content) {
    try {
      await alertsAPI.addNote(alertId, { content, author: 'Investigator' });
      showSuccess('Note added successfully');
      await loadAlerts();
    } catch (error) {
      showError(`Failed to add note: ${error.message}`);
    }
  }

  function handleExport() {
    window.open(alertsAPI.exportCSV(), '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Fraud Alerts</h1>
          <p className="text-navy-300 mt-1">
            {filteredAlerts.length} of {alerts.length} alerts
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Alert ID, account..."
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Risk Level</label>
            <select
              value={filters.riskBand}
              onChange={(e) => setFilters({ ...filters, riskBand: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="CIRCULAR_TRANSFER">Circular Transfer</option>
              <option value="RAPID_MOVEMENT">Rapid Movement</option>
              <option value="SUSPICIOUS_CHAIN">Suspicious Chain</option>
              <option value="POTENTIAL_MULE">Potential Mule</option>
              <option value="TRANSACTION_BURST">Transaction Burst</option>
              <option value="HIGH_VALUE">High Value</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ESCALATED">Escalated</option>
              <option value="CLEARED">Cleared</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="card-hover p-6 cursor-pointer"
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm text-cyan-400 mb-1">{alert.id}</p>
                <p className="text-xs text-navy-400">{formatDateTime(alert.detectedAt)}</p>
              </div>
              <Badge variant={getRiskBadgeVariant(alert.riskBand)}>
                {alert.riskBand} ({alert.riskScore})
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              {alert.category.replace(/_/g, ' ')}
            </h3>

            <p className="text-sm text-navy-300 mb-4 line-clamp-2">{alert.evidence}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-wrap">
                {alert.accounts.slice(0, 2).map((acc, i) => (
                  <span key={i} className="text-xs font-mono bg-navy-800 px-2 py-1 rounded">
                    {acc}
                  </span>
                ))}
                {alert.accounts.length > 2 && (
                  <span className="text-xs text-navy-400 px-2 py-1">
                    +{alert.accounts.length - 2}
                  </span>
                )}
              </div>
              <Badge variant={getStatusBadgeVariant(alert.status)}>{alert.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="card p-12 text-center">
          <Flag className="w-12 h-12 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-400">No alerts found matching your filters</p>
        </div>
      )}

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title="Alert Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-cyan-400 mb-1">{selectedAlert.id}</p>
                <p className="text-sm text-navy-400">{formatDateTime(selectedAlert.detectedAt)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={getRiskBadgeVariant(selectedAlert.riskBand)}>
                  {selectedAlert.riskBand} ({selectedAlert.riskScore})
                </Badge>
                <Badge variant={getStatusBadgeVariant(selectedAlert.status)}>
                  {selectedAlert.status}
                </Badge>
              </div>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Category</h3>
              <p className="text-white">{selectedAlert.category.replace(/_/g, ' ')}</p>
            </div>

            {/* Evidence */}
            <div>
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Evidence</h3>
              <p className="text-white bg-navy-800 p-4 rounded-lg">{selectedAlert.evidence}</p>
            </div>

            {/* Accounts */}
            <div>
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Involved Accounts</h3>
              <div className="flex gap-2 flex-wrap">
                {selectedAlert.accounts.map((acc, i) => (
                  <span key={i} className="font-mono text-sm bg-navy-800 px-3 py-1 rounded text-white">
                    {acc}
                  </span>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h3 className="text-sm font-semibold text-navy-300 mb-2">
                Supporting Transactions ({selectedAlert.transactions.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedAlert.transactions.map((txId, i) => (
                  <p key={i} className="font-mono text-sm text-navy-300 bg-navy-800 px-3 py-1 rounded">
                    {txId}
                  </p>
                ))}
              </div>
            </div>

            {/* Triggered Rules */}
            <div>
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Triggered Rules</h3>
              <div className="flex gap-2 flex-wrap">
                {selectedAlert.triggeredRules.map((rule, i) => (
                  <Badge key={i} variant="info">
                    {rule}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-navy-700">
              <h3 className="text-sm font-semibold text-navy-300 mb-3">Actions</h3>
              <div className="flex gap-3 flex-wrap">
                {selectedAlert.status !== 'UNDER_REVIEW' && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedAlert.id, 'UNDER_REVIEW', 'Starting investigation')
                    }
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                )}
                {selectedAlert.status !== 'ESCALATED' && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedAlert.id, 'ESCALATED', 'Requires higher-level review')
                    }
                    className="btn-danger flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Escalate
                  </button>
                )}
                {selectedAlert.status !== 'CLEARED' && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedAlert.id, 'CLEARED', 'Insufficient evidence of fraud')
                    }
                    className="btn bg-green-600 hover:bg-green-500 text-white flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
