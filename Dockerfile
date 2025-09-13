# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules and curl for health check
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Copy schema first (needed for Prisma generation)
COPY db/ ./db/

# Install ALL dependencies (we need devDependencies for build)
RUN npm ci && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate --schema=db/schema.prisma

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove development dependencies but preserve Prisma client
RUN rm -rf src tests && \
    npm ci --only=production && \
    npx prisma generate --schema=db/schema.prisma && \
    npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]