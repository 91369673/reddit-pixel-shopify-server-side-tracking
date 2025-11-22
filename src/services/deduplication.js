import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const pool = new Pool(config.database);

export async function isDuplicate(eventId) {
  const result = await pool.query(
    'SELECT event_id FROM events WHERE event_id = $1',
    [eventId]
  );

  return result.rows.length > 0;
}

export async function saveEvent(eventData) {
  const {
    event_id,
    event_type,
    shopify_id,
    shopify_payload,
    reddit_payload,
  } = eventData;

  await pool.query(
    `INSERT INTO events (event_id, event_type, shopify_id, shopify_payload, reddit_payload, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [
      event_id,
      event_type,
      shopify_id,
      JSON.stringify(shopify_payload),
      JSON.stringify(reddit_payload),
    ]
  );

  logger.info('Event saved to database', { event_id, event_type });
}

export async function markEventSent(eventId, response) {
  await pool.query(
    `UPDATE events
     SET status = 'sent', sent_at = NOW(), reddit_response = $2
     WHERE event_id = $1`,
    [eventId, JSON.stringify(response)]
  );
}

export async function markEventFailed(eventId, error) {
  await pool.query(
    `UPDATE events
     SET status = 'failed', error_message = $2
     WHERE event_id = $1`,
    [eventId, error.message]
  );
}
