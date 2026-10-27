import express from 'express';
import { z } from 'zod';
import { dataRepository } from '../repositories/dataRepository.js';

const router = express.Router();

// Validation schema
const transactionSchema = z.object({
  id: z.string().min(1),
  sender: z.string().min(1),
  receiver: z.string().min(1),
  amount: z.number().positive().finite(),
  currency: z.string().default('USD'),
  timestamp: z.string().datetime(),
  channel: z.string().optional(),
  status: z.string().optional()
});

// GET /api/transactions
router.get('/', (req, res) => {
  try {
    const transactions = dataRepository.getAllTransactions();
    const { search, minAmount, maxAmount, channel, status } = req.query;

    let filtered = transactions;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.id.toLowerCase().includes(searchLower) ||
        tx.sender.toLowerCase().includes(searchLower) ||
        tx.receiver.toLowerCase().includes(searchLower)
      );
    }

    if (minAmount) {
      filtered = filtered.filter(tx => tx.amount >= parseFloat(minAmount));
    }

    if (maxAmount) {
      filtered = filtered.filter(tx => tx.amount <= parseFloat(maxAmount));
    }

    if (channel) {
      filtered = filtered.filter(tx => tx.channel === channel);
    }

    if (status) {
      filtered = filtered.filter(tx => tx.status === status);
    }

    res.json({
      transactions: filtered,
      total: filtered.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', (req, res) => {
  try {
    const transaction = dataRepository.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transactions/import
router.post('/import', (req, res) => {
  try {
    const { transactions, mode = 'append' } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Transactions array is required' });
    }

    // Validate all transactions
    const validated = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const tx = transactionSchema.parse(transactions[i]);
        validated.push(tx);
      } catch (error) {
        errors.push({
          row: i + 1,
          transaction: transactions[i],
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
    }

    if (validated.length === 0) {
      return res.status(400).json({
        error: 'No valid transactions to import',
        validationErrors: errors
      });
    }

    // Import based on mode
    if (mode === 'replace') {
      dataRepository.setTransactions(validated);
    } else {
      dataRepository.addTransactions(validated);
    }

    res.json({
      success: true,
      imported: validated.length,
      rejected: errors.length,
      validationErrors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/export
router.get('/export/csv', (req, res) => {
  try {
    const transactions = dataRepository.getAllTransactions();
    
    // Generate CSV
    const headers = ['id', 'sender', 'receiver', 'amount', 'currency', 'timestamp', 'channel', 'status'];
    const csv = [
      headers.join(','),
      ...transactions.map(tx =>
        headers.map(h => {
          const value = tx[h] || '';
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
