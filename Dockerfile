# Use Node.js 23 Alpine for smaller image size
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules and curl for health check
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=db/schema.prisma

# Build TypeScript
RUN npm run build

# Remove development dependencies and source files
RUN rm -rf src tests node_modules && \
    npm ci --only=production --ignore-scripts && \
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