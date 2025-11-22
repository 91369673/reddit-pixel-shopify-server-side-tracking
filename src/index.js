import express from 'express';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { rawBodyCapture, verifyShopifyWebhook } from './middleware/shopifyVerify.js';
import healthRouter from './routes/health.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

// Health check (no authentication)
app.use('/', healthRouter);

// Shopify webhooks (with HMAC verification)
// Important: rawBodyCapture must come before verifyShopifyWebhook
app.use('/webhooks/shopify', rawBodyCapture);
app.use('/webhooks/shopify', verifyShopifyWebhook);
app.use('/', webhooksRouter);

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
