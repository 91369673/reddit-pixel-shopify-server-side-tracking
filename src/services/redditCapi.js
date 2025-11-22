import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export async function sendToReddit(eventData) {
  const payload = {
    events: [eventData],
  };

  logger.info('Sending event to Reddit CAPI', {
    tracking_type: eventData.event_type.tracking_type,
    conversion_id: eventData.event_metadata.conversion_id,
  });

  // Retry logic: 3 attempts with exponential backoff
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(config.reddit.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.reddit.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (response.ok) {
        logger.info('Reddit CAPI success', {
          status: response.status,
          attempt,
        });

        return {
          success: true,
          status: response.status,
          response: responseText,
        };
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        logger.warn(`Rate limited by Reddit, retry after ${retryAfter}s`);

        await sleep(retryAfter * 1000);
        continue;
      }

      // Log error but retry
      logger.error('Reddit API error', {
        status: response.status,
        response: responseText,
        attempt,
      });

      lastError = new Error(`Reddit API error: ${response.status} - ${responseText}`);

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < 3) {
        await sleep(Math.pow(2, attempt - 1) * 1000);
      }

    } catch (error) {
      logger.error('Network error sending to Reddit', {
        error: error.message,
        attempt,
      });

      lastError = error;

      if (attempt < 3) {
        await sleep(Math.pow(2, attempt - 1) * 1000);
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
