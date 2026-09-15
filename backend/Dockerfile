# Multi-stage production Dockerfile for NearHire Backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper signal forwarding
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Create non-root user
USER node

EXPOSE 5000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
