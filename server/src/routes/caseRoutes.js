import express from 'express';
import { z } from 'zod';
import { dataRepository } from '../repositories/dataRepository.js';

const router = express.Router();

const caseSchema = z.object({
  title: z.string().min(1),
  alertIds: z.array(z.string()).default([]),
  accounts: z.array(z.string()).default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).default('OPEN'),
  assignee: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/cases
router.get('/', (req, res) => {
  try {
    const cases = dataRepository.getAllCases();
    res.json({ cases, total: cases.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cases/:id
router.get('/:id', (req, res) => {
  try {
    const caseData = dataRepository.getCaseById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cases
router.post('/', (req, res) => {
  try {
    const validated = caseSchema.parse(req.body);
    const newCase = dataRepository.createCase(validated);
    res.status(201).json(newCase);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/cases/:id
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updated = dataRepository.updateCase(req.params.id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
