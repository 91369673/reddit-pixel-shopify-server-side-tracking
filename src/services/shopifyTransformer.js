import { hashEmail, hashPhone } from './crypto.js';

export function transformOrderToPurchase(order) {
  const eventId = `shopify_order_${order.id}_${Date.now()}`;

  const redditEvent = {
    event_at: order.created_at,
    event_type: {
      tracking_type: 'Purchase',
    },
    user: {
      // Hash PII for privacy
      email: hashEmail(order.email),
      ...(order.phone && { phone_number: hashPhone(order.phone) }),

      // IP and User Agent if available
      ...(order.browser_ip && { ip_address: order.browser_ip }),
      ...(order.client_details?.user_agent && {
        user_agent: order.client_details.user_agent
      }),
    },
    event_metadata: {
      // Reddit requires value as integer in minor currency units (cents)
      value: Math.round((parseFloat(order.total_price) || 0) * 100),

      // Unique ID for deduplication
      conversion_id: String(order.id),

      currency: order.currency,

      // Optional: Product details
      item_count: order.line_items?.length || 0,

      // Custom data for tracking
      order_number: order.order_number,
    },
  };

  return {
    event_id: eventId,
    event_type: 'Purchase',
    shopify_id: String(order.id),
    reddit_payload: redditEvent,
  };
}

export function transformCheckoutToLead(checkout) {
  const eventId = `shopify_checkout_${checkout.id}_${Date.now()}`;

  const redditEvent = {
    event_at: checkout.created_at,
    event_type: {
      tracking_type: 'Lead',
    },
    user: {
      email: hashEmail(checkout.email),
      ...(checkout.phone && { phone_number: hashPhone(checkout.phone) }),
    },
    event_metadata: {
      value: Math.round((parseFloat(checkout.total_price) || 0) * 100),
      conversion_id: String(checkout.id),
      currency: checkout.currency,
    },
  };

  return {
    event_id: eventId,
    event_type: 'Lead',
    shopify_id: String(checkout.id),
    reddit_payload: redditEvent,
  };
}
