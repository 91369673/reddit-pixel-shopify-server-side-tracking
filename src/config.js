export const config = {
  port: process.env.PORT || 3000,

  shopify: {
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
  },

  reddit: {
    pixelId: process.env.REDDIT_PIXEL_ID,
    accessToken: process.env.REDDIT_ACCESS_TOKEN,
    apiUrl: 'https://ads-api.reddit.com/api/v2.0/conversions/events',
  },

  database: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'reddit_capi',
    user: process.env.DB_USER || 'reddit_capi',
    password: process.env.DB_PASSWORD,
  },
};
