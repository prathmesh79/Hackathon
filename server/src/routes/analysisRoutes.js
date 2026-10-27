import express from 'express';
import { dataRepository } from '../repositories/dataRepository.js';
import { FraudDetectionService } from '../services/fraudDetectionService.js';

const router = express.Router();

// GET /api/analysis/summary
router.get('/summary', (req, res) => {
  try {
    const results = dataRepository.getAnalysisResults();
    
    if (!results) {
      return res.json({
        analyzed: false,
        message: 'No analysis has been run yet'
      });
    }

    res.json({
      analyzed: true,
      ...results.summary,
      alertsBreakdown: {
        low: results.alerts.filter(a => a.riskBand === 'LOW').length,
        medium: results.alerts.filter(a => a.riskBand === 'MEDIUM').length,
        high: results.alerts.filter(a => a.riskBand === 'HIGH').length,
        critical: results.alerts.filter(a => a.riskBand === 'CRITICAL').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analysis/run
router.post('/run', async (req, res) => {
  try {
    if (dataRepository.isAnalyzing) {
      return res.status(409).json({ error: 'Analysis already in progress' });
    }

    dataRepository.isAnalyzing = true;

    const transactions = dataRepository.getAllTransactions();
    
    if (transactions.length === 0) {
      dataRepository.isAnalyzing = false;
      return res.status(400).json({ error: 'No transactions to analyze' });
    }

    const settings = dataRepository.getSettings();
    const fraudDetection = new FraudDetectionService(settings);
    
    const results = fraudDetection.analyzeTransactions(transactions);
    
    // Store results
    dataRepository.setAnalysisResults(results);
    dataRepository.setAlerts(results.alerts);

    dataRepository.isAnalyzing = false;

    res.json({
      success: true,
      summary: results.summary,
      alertsGenerated: results.alerts.length
    });
  } catch (error) {
    dataRepository.isAnalyzing = false;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analysis/graph
router.get('/graph', (req, res) => {
  try {
    const results = dataRepository.getAnalysisResults();
    
    if (!results) {
      return res.status(404).json({ error: 'No analysis results available. Run analysis first.' });
    }

    res.json(results.graphData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
