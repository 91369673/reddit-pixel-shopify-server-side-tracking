import crypto from 'crypto';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// Read raw body for HMAC verification and parse JSON
export function rawBodyCapture(req, res, next) {
  let data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    // Store raw body for HMAC verification
    req.rawBody = data;

    // Parse JSON and set as req.body
    // Important: Don't use express.json() middleware - it consumes the stream
    try {
      req.body = JSON.parse(data);
    } catch (error) {
      logger.error('Failed to parse JSON body:', error);
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    next();
  });
}

export function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get('X-Shopify-Hmac-SHA256');

  if (!hmacHeader) {
    logger.warn('Missing HMAC header');
    return res.status(401).json({ error: 'Unauthorized - Missing HMAC' });
  }

  // Calculate HMAC using raw body
  const hash = crypto
    .createHmac('sha256', config.shopify.webhookSecret)
    .update(req.rawBody)
    .digest('base64');

  if (hash !== hmacHeader) {
    logger.warn('HMAC verification failed');
    return res.status(401).json({ error: 'Unauthorized - Invalid HMAC' });
  }

  logger.info('Webhook HMAC verified', {
    topic: req.get('X-Shopify-Topic'),
  });

  next();
}
