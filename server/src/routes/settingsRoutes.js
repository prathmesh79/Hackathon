import express from 'express';
import { dataRepository } from '../repositories/dataRepository.js';

const router = express.Router();

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const settings = dataRepository.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    // Validate numeric values
    const numericFields = [
      'rapidTransferWindowMinutes',
      'minChainLength',
      'maxCycleLength',
      'unusualAmountThreshold',
      'burstThreshold',
      'circularTransferWeight',
      'rapidMovementWeight',
      'suspiciousChainWeight',
      'muleAccountWeight',
      'unusualActivityWeight'
    ];

    for (const field of numericFields) {
      if (updates[field] !== undefined) {
        const value = Number(updates[field]);
        if (isNaN(value) || value < 0) {
          return res.status(400).json({ error: `${field} must be a positive number` });
        }
      }
    }

    const updated = dataRepository.updateSettings(updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
