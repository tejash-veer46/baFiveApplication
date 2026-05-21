FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["npm", "start"]
