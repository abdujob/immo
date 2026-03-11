# Dockerfile for Backend

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json backend/

# Install dependencies
RUN npm install --production=false

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 4000

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "run", "start:prod"]
