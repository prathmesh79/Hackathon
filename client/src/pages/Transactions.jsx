import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Modal from '../components/shared/Modal';
import { transactionsAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { useNotifications } from '../hooks/useNotifications';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    channel: '',
    status: ''
  });
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const { showSuccess, showError } = useNotifications();

  const itemsPerPage = 20;

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, search, filters, sortField, sortDirection]);

  async function loadTransactions() {
    try {
      setLoading(true);
      const data = await transactionsAPI.getAll();
      setTransactions(data.transactions || []);
    } catch (error) {
      showError(`Failed to load transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...transactions];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.id.toLowerCase().includes(searchLower) ||
          tx.sender.toLowerCase().includes(searchLower) ||
          tx.receiver.toLowerCase().includes(searchLower)
      );
    }

    // Amount range
    if (filters.minAmount) {
      filtered = filtered.filter(tx => tx.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(tx => tx.amount <= parseFloat(filters.maxAmount));
    }

    // Channel and status
    if (filters.channel) {
      filtered = filtered.filter(tx => tx.channel === filters.channel);
    }
    if (filters.status) {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  function clearFilters() {
    setSearch('');
    setFilters({
      minAmount: '',
      maxAmount: '',
      channel: '',
      status: ''
    });
  }

  async function handleImport() {
    try {
      const lines = importData.trim().split('\n');
      if (lines.length < 2) {
        showError('CSV must contain headers and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['id', 'sender', 'receiver', 'amount', 'currency', 'timestamp'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        showError(`Missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      const transactions = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const tx = {};
        headers.forEach((header, index) => {
          tx[header] = header === 'amount' ? parseFloat(values[index]) : values[index];
        });
        transactions.push(tx);
      }

      const result = await transactionsAPI.import({ transactions, mode: 'append' });
      showSuccess(`Imported ${result.imported} transactions`);
      if (result.rejected > 0) {
        showError(`${result.rejected} transactions were rejected due to validation errors`);
      }
      setShowImportModal(false);
      setImportData('');
      await loadTransactions();
    } catch (error) {
      showError(`Import failed: ${error.message}`);
    }
  }

  function handleExport() {
    window.open(transactionsAPI.exportCSV(), '_blank');
  }

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

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
          <h1 className="text-3xl font-bold text-white">Transaction Explorer</h1>
          <p className="text-navy-300 mt-1">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-navy-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID, sender, or receiver..."
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Min Amount</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              placeholder="0"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Max Amount</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              placeholder="∞"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-2">Channel</label>
            <select
              value={filters.channel}
              onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="WIRE">WIRE</option>
              <option value="ACH">ACH</option>
              <option value="CARD">CARD</option>
              <option value="P2P">P2P</option>
              <option value="SWIFT">SWIFT</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-secondary w-full flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-800 border-b border-navy-700">
              <tr>
                <SortableHeader field="id" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                  Transaction ID
                </SortableHeader>
                <SortableHeader field="sender" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                  Sender
                </SortableHeader>
                <SortableHeader field="receiver" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                  Receiver
                </SortableHeader>
                <SortableHeader field="amount" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                  Amount
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-300 uppercase tracking-wider">
                  Channel
                </th>
                <SortableHeader field="timestamp" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                  Timestamp
                </SortableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-navy-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-navy-200">
                    {tx.sender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-navy-200">
                    {tx.receiver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                    {formatCurrency(tx.amount, tx.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-300">
                    {tx.channel || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-300">
                    {formatDateTime(tx.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-navy-700 flex items-center justify-between">
            <div className="text-sm text-navy-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{' '}
              {filteredTransactions.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Transactions from CSV"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-navy-300">
            Paste CSV data with headers: id, sender, receiver, amount, currency, timestamp
          </p>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="id,sender,receiver,amount,currency,timestamp&#10;TX1,ACC001,ACC002,1000,USD,2024-01-15T10:00:00Z"
            className="input font-mono text-sm h-64"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowImportModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleImport} className="btn-primary">
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SortableHeader({ field, currentField, direction, onSort, children }) {
  const isActive = currentField === field;
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-navy-300 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {isActive && (direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>
    </th>
  );
}
