import express from 'express';
import pg from 'pg';
import { config } from '../config.js';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool(config.database);

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

export default router;
