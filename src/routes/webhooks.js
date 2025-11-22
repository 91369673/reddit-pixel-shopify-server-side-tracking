import express from 'express';
import { logger } from '../utils/logger.js';
import * as shopifyTransformer from '../services/shopifyTransformer.js';
import * as deduplication from '../services/deduplication.js';
import * as redditCapi from '../services/redditCapi.js';

const router = express.Router();

router.post('/webhooks/shopify', async (req, res) => {
  const topic = req.get('X-Shopify-Topic');
  const shopDomain = req.get('X-Shopify-Shop-Domain');

  logger.info('Received Shopify webhook', { topic, shopDomain });

  try {
    let eventData;

    // Route based on webhook topic
    switch (topic) {
      case 'orders/create':
        eventData = shopifyTransformer.transformOrderToPurchase(req.body);
        break;

      case 'checkouts/create':
        eventData = shopifyTransformer.transformCheckoutToLead(req.body);
        break;

      default:
        logger.info('Unsupported webhook topic', { topic });
        return res.status(200).json({
          status: 'ignored',
          message: `Topic ${topic} not supported`,
        });
    }

    // Check for duplicates
    if (await deduplication.isDuplicate(eventData.event_id)) {
      logger.info('Duplicate event detected', { event_id: eventData.event_id });
      return res.status(200).json({ status: 'duplicate' });
    }

    // Save to database
    await deduplication.saveEvent({
      ...eventData,
      shopify_payload: req.body,
    });

    // Send to Reddit CAPI
    try {
      const result = await redditCapi.sendToReddit(eventData.reddit_payload);

      await deduplication.markEventSent(eventData.event_id, result);

      return res.status(200).json({
        status: 'success',
        event_id: eventData.event_id,
      });

    } catch (error) {
      await deduplication.markEventFailed(eventData.event_id, error);

      // Still return 200 to Shopify so it doesn't retry
      return res.status(200).json({
        status: 'failed',
        event_id: eventData.event_id,
        error: error.message,
      });
    }

  } catch (error) {
    logger.error('Error processing webhook', { error: error.message });

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;
