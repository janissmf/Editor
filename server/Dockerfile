FROM node:20-slim

USER node
WORKDIR /home/node/app

# Copy package files from parent directory
COPY --chown=node:node ../package*.json ./

COPY ../.env.production ./

# Install dependencies
RUN npm install

# Copy server files from parent directory
COPY --chown=node:node ../server ./server

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "server/index.js"]