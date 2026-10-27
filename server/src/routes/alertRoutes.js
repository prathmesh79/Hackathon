import express from 'express';
import { dataRepository } from '../repositories/dataRepository.js';

const router = express.Router();

// GET /api/alerts
router.get('/', (req, res) => {
  try {
    const alerts = dataRepository.getAllAlerts();
    const { category, riskBand, status } = req.query;

    let filtered = alerts;

    if (category) {
      filtered = filtered.filter(a => a.category === category);
    }

    if (riskBand) {
      filtered = filtered.filter(a => a.riskBand === riskBand);
    }

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({
      alerts: filtered,
      total: filtered.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts/:id
router.get('/:id', (req, res) => {
  try {
    const alert = dataRepository.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/alerts/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['NEW', 'UNDER_REVIEW', 'ESCALATED', 'CLEARED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const alert = dataRepository.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Add to audit history
    if (!alert.auditHistory) alert.auditHistory = [];
    alert.auditHistory.push({
      action: 'STATUS_CHANGE',
      oldStatus: alert.status,
      newStatus: status,
      reason,
      timestamp: new Date().toISOString()
    });

    const updated = dataRepository.updateAlert(req.params.id, {
      status,
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/alerts/:id/notes
router.post('/:id/notes', (req, res) => {
  try {
    const { content, author } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const alert = dataRepository.addAlertNote(req.params.id, {
      content,
      author: author || 'Investigator'
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts/export/csv
router.get('/export/csv', (req, res) => {
  try {
    const alerts = dataRepository.getAllAlerts();
    
    const headers = ['id', 'category', 'riskScore', 'riskBand', 'status', 'accounts', 'evidence', 'detectedAt'];
    const csv = [
      headers.join(','),
      ...alerts.map(alert =>
        [
          alert.id,
          alert.category,
          alert.riskScore,
          alert.riskBand,
          alert.status,
          `"${alert.accounts.join(', ')}"`,
          `"${alert.evidence.replace(/"/g, '""')}"`,
          alert.detectedAt
        ].join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
