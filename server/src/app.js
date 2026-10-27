import express from 'express';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/demo', demoRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}
