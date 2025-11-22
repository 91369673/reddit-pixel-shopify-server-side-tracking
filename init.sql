CREATE TABLE IF NOT EXISTS events (
  event_id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  shopify_id VARCHAR(255) NOT NULL,
  shopify_payload JSONB,
  reddit_payload JSONB,
  reddit_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_shopify_id ON events(shopify_id);
