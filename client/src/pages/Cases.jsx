import { useState, useEffect } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import Modal from '../components/shared/Modal';
import { casesAPI } from '../services/api';
import { formatDateTime, getStatusBadgeVariant } from '../utils/formatters';
import { useNotifications } from '../hooks/useNotifications';

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    alertIds: '',
    accounts: '',
    priority: 'MEDIUM',
    notes: ''
  });
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      const data = await casesAPI.getAll();
      setCases(data.cases || []);
    } catch (error) {
      showError(`Failed to load cases: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCase() {
    try {
      if (!newCase.title.trim()) {
        showError('Case title is required');
        return;
      }

      const caseData = {
        title: newCase.title,
        alertIds: newCase.alertIds.split(',').map(s => s.trim()).filter(Boolean),
        accounts: newCase.accounts.split(',').map(s => s.trim()).filter(Boolean),
        priority: newCase.priority,
        notes: newCase.notes,
        status: 'OPEN',
        assignee: 'Current User'
      };

      await casesAPI.create(caseData);
      showSuccess('Case created successfully');
      setShowCreateModal(false);
      setNewCase({
        title: '',
        alertIds: '',
        accounts: '',
        priority: 'MEDIUM',
        notes: ''
      });
      await loadCases();
    } catch (error) {
      showError(`Failed to create case: ${error.message}`);
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
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Investigation Cases</h1>
          <p className="text-navy-300 mt-1">{cases.length} total cases</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Cases Grid */}
      {cases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="font-mono text-sm text-cyan-400 mb-1">{caseItem.id}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{caseItem.title}</h3>
                </div>
                <Badge variant={caseItem.priority === 'CRITICAL' ? 'critical' : caseItem.priority === 'HIGH' ? 'high' : 'medium'}>
                  {caseItem.priority}
                </Badge>
              </div>

              {caseItem.notes && (
                <p className="text-sm text-navy-300 mb-4 line-clamp-2">{caseItem.notes}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-navy-400">
                  <span>Alerts:</span>
                  <span className="text-white">{caseItem.alertIds?.length || 0}</span>
                </div>
                <div className="flex justify-between text-navy-400">
                  <span>Accounts:</span>
                  <span className="text-white">{caseItem.accounts?.length || 0}</span>
                </div>
                <div className="flex justify-between text-navy-400">
                  <span>Assignee:</span>
                  <span className="text-white">{caseItem.assignee || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-navy-400">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(caseItem.status)}>{caseItem.status}</Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-navy-700">
                <p className="text-xs text-navy-400">
                  Created: {formatDateTime(caseItem.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-400 mb-4">No investigation cases yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Case
          </button>
        </div>
      )}

      {/* Create Case Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Investigation Case"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Case Title *</label>
            <input
              type="text"
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              placeholder="Suspicious circular transfer investigation"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Alert IDs (comma-separated)
            </label>
            <input
              type="text"
              value={newCase.alertIds}
              onChange={(e) => setNewCase({ ...newCase, alertIds: e.target.value })}
              placeholder="ALERT-000001, ALERT-000002"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">
              Account IDs (comma-separated)
            </label>
            <input
              type="text"
              value={newCase.accounts}
              onChange={(e) => setNewCase({ ...newCase, accounts: e.target.value })}
              placeholder="ACC001, ACC002, ACC003"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Priority</label>
            <select
              value={newCase.priority}
              onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
              className="input"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Initial Notes</label>
            <textarea
              value={newCase.notes}
              onChange={(e) => setNewCase({ ...newCase, notes: e.target.value })}
              placeholder="Describe the investigation scope and initial findings..."
              className="input h-32"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateCase} className="btn-primary">
              Create Case
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
