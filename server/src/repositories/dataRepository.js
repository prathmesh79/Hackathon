import { demoTransactions } from '../data/demoTransactions.js';

/**
 * In-memory data repository
 * For production, this would be replaced with MongoDB or another database
 */
class DataRepository {
  constructor() {
    this.transactions = [...demoTransactions];
    this.alerts = [];
    this.cases = [];
    this.settings = {
      rapidTransferWindowMinutes: 30,
      minChainLength: 3,
      maxCycleLength: 5,
      unusualAmountThreshold: 50000,
      burstThreshold: 10,
      circularTransferWeight: 30,
      rapidMovementWeight: 20,
      suspiciousChainWeight: 15,
      muleAccountWeight: 20,
      unusualActivityWeight: 10
    };
    this.analysisResults = null;
    this.isAnalyzing = false;
  }

  // Transactions
  getAllTransactions() {
    return [...this.transactions];
  }

  getTransactionById(id) {
    return this.transactions.find(tx => tx.id === id);
  }

  addTransactions(transactions) {
    this.transactions.push(...transactions);
  }

  setTransactions(transactions) {
    this.transactions = [...transactions];
  }

  clearTransactions() {
    this.transactions = [];
  }

  // Alerts
  getAllAlerts() {
    return [...this.alerts];
  }

  getAlertById(id) {
    return this.alerts.find(alert => alert.id === id);
  }

  setAlerts(alerts) {
    this.alerts = [...alerts];
  }

  updateAlert(id, updates) {
    const index = this.alerts.findIndex(alert => alert.id === id);
    if (index !== -1) {
      this.alerts[index] = { ...this.alerts[index], ...updates };
      return this.alerts[index];
    }
    return null;
  }

  addAlertNote(alertId, note) {
    const alert = this.getAlertById(alertId);
    if (alert) {
      if (!alert.notes) alert.notes = [];
      alert.notes.push({
        ...note,
        timestamp: new Date().toISOString()
      });
      return alert;
    }
    return null;
  }

  // Cases
  getAllCases() {
    return [...this.cases];
  }

  getCaseById(id) {
    return this.cases.find(c => c.id === id);
  }

  createCase(caseData) {
    const newCase = {
      id: `CASE-${String(this.cases.length + 1).padStart(6, '0')}`,
      ...caseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.cases.push(newCase);
    return newCase;
  }

  updateCase(id, updates) {
    const index = this.cases.findIndex(c => c.id === id);
    if (index !== -1) {
      this.cases[index] = {
        ...this.cases[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return this.cases[index];
    }
    return null;
  }

  // Settings
  getSettings() {
    return { ...this.settings };
  }

  updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  // Analysis Results
  setAnalysisResults(results) {
    this.analysisResults = results;
  }

  getAnalysisResults() {
    return this.analysisResults;
  }

  // Reset to demo data
  resetToDemo() {
    this.transactions = [...demoTransactions];
    this.alerts = [];
    this.cases = [];
    this.analysisResults = null;
    this.isAnalyzing = false;
  }
}

// Singleton instance
export const dataRepository = new DataRepository();
