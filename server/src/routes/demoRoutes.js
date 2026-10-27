import express from 'express';
import { dataRepository } from '../repositories/dataRepository.js';

const router = express.Router();

// POST /api/demo/reset
router.post('/reset', (req, res) => {
  try {
    dataRepository.resetToDemo();
    res.json({
      success: true,
      message: 'Demo data restored successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
