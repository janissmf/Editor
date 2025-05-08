FROM node:20-slim as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy .env file (no ../ needed)
COPY .env.production ./

# Copy frontend files
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install serve with correct permissions
USER root
RUN npm install -g serve
USER node

# Copy built files from build stage
COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]