FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/worker.js"]
