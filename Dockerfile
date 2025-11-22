FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY src ./src

# Run as non-root user
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
