FROM node:18-alpine

WORKDIR /app

# Copy backend package files from the backend directory
COPY backend/package.json ./

# Install dependencies
RUN npm install --only=production

# Copy backend source code
COPY backend/ .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["npm", "start"]
